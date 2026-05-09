"""
Test suite for grammar checking pipeline.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from dataclasses import dataclass

from backend.services.grammar.pipeline import run_pipeline
from backend.services.grammar.languagetool_client import RawError, LTUnavailableError
from backend.services.grammar.llm_refiner import LLMUnavailableError
from backend.models.response import NormalizedError


@pytest.fixture
def mock_cache():
    """Mock GrammarCache."""
    with patch('backend.services.grammar.pipeline.GrammarCache') as mock:
        cache_instance = MagicMock()
        cache_instance.get = AsyncMock(return_value=None)
        cache_instance.set = AsyncMock(return_value=True)
        mock.return_value = cache_instance
        yield cache_instance


@pytest.fixture
def sample_lt_errors():
    """Sample LanguageTool errors."""
    return [
        RawError(
            original="teh",
            correction="the",
            offset=0,
            length=3,
            rule_id="MORFOLOGIK_RULE_EN_US",
            category="TYPOS",
            message="Possible spelling mistake found.",
            source="rule_based"
        )
    ]


@pytest.fixture
def sample_llm_errors():
    """Sample LLM errors."""
    return [
        NormalizedError(
            original="was going",
            correction="went",
            error_type="tense",
            explanation="Use simple past tense instead of past continuous.",
            source="llm",
            offset=None
        )
    ]


@pytest.mark.asyncio
async def test_normal_flow(mock_cache, sample_lt_errors, sample_llm_errors):
    """Test 1: Normal flow - both LT and LLM work."""
    with patch('backend.services.grammar.pipeline.LanguageToolMCP') as mock_lt, \
         patch('backend.services.grammar.pipeline.OpenAIGrammarMCP') as mock_llm:
        
        # Setup mocks
        lt_instance = MagicMock()
        lt_instance.check_grammar = AsyncMock(return_value=sample_lt_errors)
        mock_lt.return_value = lt_instance
        
        llm_instance = MagicMock()
        llm_instance.refine_grammar = AsyncMock(return_value=sample_llm_errors)
        mock_llm.return_value = llm_instance
        
        # Run pipeline
        result = await run_pipeline("teh cat was going home")
        
        # Assertions
        assert result.source == "pipeline"
        assert result.error_count == 2
        assert result.fallback_used is False
        assert len(result.errors) == 2


@pytest.mark.asyncio
async def test_lt_unavailable(mock_cache, sample_llm_errors):
    """Test 2: LT unavailable - fallback to LLM only."""
    with patch('backend.services.grammar.pipeline.LanguageToolMCP') as mock_lt, \
         patch('backend.services.grammar.pipeline.OpenAIGrammarMCP') as mock_llm:
        
        # Setup mocks
        lt_instance = MagicMock()
        lt_instance.check_grammar = AsyncMock(side_effect=LTUnavailableError("Service down"))
        mock_lt.return_value = lt_instance
        
        llm_instance = MagicMock()
        llm_instance.refine_grammar = AsyncMock(return_value=sample_llm_errors)
        mock_llm.return_value = llm_instance
        
        # Run pipeline
        result = await run_pipeline("The cat was going home")
        
        # Assertions
        assert result.source == "pipeline"
        assert result.fallback_used is True
        assert result.error_count == 1


@pytest.mark.asyncio
async def test_llm_unavailable(mock_cache, sample_lt_errors):
    """Test 3: LLM unavailable - fallback to LT only."""
    with patch('backend.services.grammar.pipeline.LanguageToolMCP') as mock_lt, \
         patch('backend.services.grammar.pipeline.OpenAIGrammarMCP') as mock_llm:
        
        # Setup mocks
        lt_instance = MagicMock()
        lt_instance.check_grammar = AsyncMock(return_value=sample_lt_errors)
        mock_lt.return_value = lt_instance
        
        llm_instance = MagicMock()
        llm_instance.refine_grammar = AsyncMock(side_effect=LLMUnavailableError("API error"))
        mock_llm.return_value = llm_instance
        
        # Run pipeline
        result = await run_pipeline("teh cat went home")
        
        # Assertions
        assert result.source == "pipeline"
        assert result.fallback_used is True
        assert result.error_count == 1


@pytest.mark.asyncio
async def test_both_unavailable(mock_cache):
    """Test 4: Both unavailable - return empty errors, no exception."""
    with patch('backend.services.grammar.pipeline.LanguageToolMCP') as mock_lt, \
         patch('backend.services.grammar.pipeline.OpenAIGrammarMCP') as mock_llm:
        
        # Setup mocks
        lt_instance = MagicMock()
        lt_instance.check_grammar = AsyncMock(side_effect=LTUnavailableError("Service down"))
        mock_lt.return_value = lt_instance
        
        llm_instance = MagicMock()
        llm_instance.refine_grammar = AsyncMock(side_effect=LLMUnavailableError("API error"))
        mock_llm.return_value = llm_instance
        
        # Run pipeline - should not raise exception
        result = await run_pipeline("The cat went home")
        
        # Assertions
        assert result.source == "pipeline"
        assert result.fallback_used is True
        assert result.error_count == 0
        # When both services fail, no errors are found, so score is 100 (perfect)
        assert result.score == 100
        assert result.grade == "A"


@pytest.mark.asyncio
async def test_cache_hit():
    """Test 5: Cache hit - return cached result without calling LT or LLM."""
    cached_data = {
        "corrected_text": "The cat went home.",
        "errors_json": [],
        "score": 100,
        "grade": "A",
        "error_breakdown": {},
        "feedback": "Perfect!"
    }
    
    with patch('backend.services.grammar.pipeline.GrammarCache') as mock_cache_class, \
         patch('backend.services.grammar.pipeline.LanguageToolMCP') as mock_lt, \
         patch('backend.services.grammar.pipeline.OpenAIGrammarMCP') as mock_llm:
        
        # Setup cache mock
        cache_instance = MagicMock()
        cache_instance.get = AsyncMock(return_value=cached_data)
        mock_cache_class.return_value = cache_instance
        
        # Setup LT and LLM mocks (should not be called)
        lt_instance = MagicMock()
        lt_instance.check_grammar = AsyncMock()
        mock_lt.return_value = lt_instance
        
        llm_instance = MagicMock()
        llm_instance.refine_grammar = AsyncMock()
        mock_llm.return_value = llm_instance
        
        # Run pipeline
        result = await run_pipeline("The cat went home")
        
        # Assertions
        assert result.source == "cache"
        assert result.score == 100
        assert result.grade == "A"
        
        # Verify LT and LLM were NOT called
        lt_instance.check_grammar.assert_not_called()
        llm_instance.refine_grammar.assert_not_called()


@pytest.mark.asyncio
async def test_high_error_rate_warning(mock_cache):
    """Test 6: High error rate (>60%) triggers warning."""
    # Create many errors to exceed 60% threshold
    many_errors = [
        RawError(
            original=f"error{i}",
            correction=f"correct{i}",
            offset=i * 10,
            length=6,
            rule_id="TEST_RULE",
            category="TYPOS",
            message="Test error",
            source="rule_based"
        )
        for i in range(10)
    ]
    
    with patch('backend.services.grammar.pipeline.LanguageToolMCP') as mock_lt, \
         patch('backend.services.grammar.pipeline.OpenAIGrammarMCP') as mock_llm:
        
        # Setup mocks
        lt_instance = MagicMock()
        lt_instance.check_grammar = AsyncMock(return_value=many_errors)
        mock_lt.return_value = lt_instance
        
        llm_instance = MagicMock()
        llm_instance.refine_grammar = AsyncMock(return_value=[])
        mock_llm.return_value = llm_instance
        
        # Run pipeline with short text (high error/word ratio)
        result = await run_pipeline("one two three four five")
        
        # Assertions
        assert result.warning is not None
        assert "High error rate" in result.warning
