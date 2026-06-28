"""
Main grammar checking pipeline orchestrator.
Coordinates preprocessing, rule-based checking, LLM refinement, and caching.
"""

import hashlib
import logging
from difflib import HtmlDiff
from dataclasses import asdict

from backend.services.grammar.preprocessor import preprocess
from backend.services.grammar.languagetool_client import (
    LanguageToolMCP, 
    LTUnavailableError
)
from backend.services.grammar.llm_refiner import (
    OpenAIGrammarMCP, 
    LLMUnavailableError
)
from backend.services.grammar.merger import merge
from backend.services.cache import GrammarCache
from backend.services.scoring import calculate_score
from backend.models.response import PipelineResult

logger = logging.getLogger(__name__)


def compute_cache_key(text: str) -> str:
    """Compute SHA-256 hash for cache key."""
    normalized = text.lower().strip()
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()


def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def generate_diff_html(original: str, corrected: str) -> str:
    """Generate HTML diff between original and corrected text."""
    differ = HtmlDiff()
    original_lines = original.splitlines()
    corrected_lines = corrected.splitlines()
    return differ.make_table(original_lines, corrected_lines)


def compute_error_breakdown(errors: list) -> dict[str, int]:
    """Compute error breakdown by type."""
    breakdown = {}
    for error in errors:
        error_type = error.error_type
        breakdown[error_type] = breakdown.get(error_type, 0) + 1
    return breakdown


async def run_pipeline(text: str) -> PipelineResult:
    """
    Run complete grammar checking pipeline.
    
    Args:
        text: Raw input text from user
        
    Returns:
        PipelineResult with corrections, errors, and scoring
        
    Flow:
        1. Preprocess text
        2. Compute cache key and check cache
        3. Run LanguageTool (with fallback)
        4. Run LLM refiner (with fallback)
        5. Merge errors
        6. Calculate score
        7. Generate diff HTML
        8. Set warning if error rate > 60%
        9. Write to cache
        10. Return result
    """
    fallback_used = False
    
    # Step 1: Preprocess
    cleaned_text = preprocess(text)
    if not cleaned_text:
        logger.warning("Empty text after preprocessing")
        return PipelineResult(
            source="pipeline",
            corrected_text="",
            errors=[],
            score=0,
            grade="D",
            word_count=0,
            error_count=0,
            error_breakdown={},
            feedback="No text provided.",
            fallback_used=False,
            warning="Input text is empty."
        )
    
    # Step 2: Compute word count and cache key
    word_count = count_words(cleaned_text)
    cache_key = compute_cache_key(cleaned_text)
    
    # Step 3: Check cache
    cache = GrammarCache()
    cached_result = await cache.get(cache_key)
    
    if cached_result:
        return PipelineResult(
            source="cache",
            corrected_text=cached_result.get("corrected_text", ""),
            errors=cached_result.get("errors_json", []),
            score=cached_result.get("score", 0),
            grade=cached_result.get("grade", "D"),
            word_count=word_count,
            error_count=len(cached_result.get("errors_json", [])),
            error_breakdown=cached_result.get("error_breakdown", {}),
            feedback=cached_result.get("feedback", ""),
            fallback_used=False,
            warning=None
        )
    
    # Step 4: Run LanguageTool
    lt_errors = []
    try:
        lt_client = LanguageToolMCP()
        lt_errors = await lt_client.check_grammar(cleaned_text)
        logger.info(f"LanguageTool found {len(lt_errors)} errors")
    except LTUnavailableError as e:
        logger.warning(f"LanguageTool unavailable: {e}")
        fallback_used = True
    
    # Step 5: Run LLM refiner
    llm_errors = []
    try:
        logger.info("[PIPELINE] 🚀 Starting LLM refiner...")
        llm_client = OpenAIGrammarMCP()
        lt_errors_dict = [asdict(e) for e in lt_errors]
        logger.info(f"[PIPELINE] Passing {len(lt_errors_dict)} LanguageTool errors to LLM...")
        llm_errors = await llm_client.refine_grammar(cleaned_text, lt_errors_dict)
        logger.info(f"[PIPELINE] ✅ LLM found {len(llm_errors)} additional errors")
    except LLMUnavailableError as e:
        logger.error(f"[PIPELINE] ⚠️  LLM unavailable: {e}")
        fallback_used = True
    
    # Step 6: Merge errors
    merged_errors = merge(lt_errors, llm_errors)
    error_count = len(merged_errors)
    
    # Step 7: Apply corrections to generate corrected text
    corrected_text = cleaned_text
    if merged_errors:
        # Sort by offset descending to apply corrections from end to start
        sorted_errors = sorted(
            [e for e in merged_errors if e.offset is not None],
            key=lambda x: x.offset,
            reverse=True
        )
        for error in sorted_errors:
            if error.offset is not None:
                start = error.offset
                end = start + len(error.original)
                corrected_text = (
                    corrected_text[:start] + 
                    error.correction + 
                    corrected_text[end:]
                )
    
    # Step 8: Calculate score
    score, grade, error_breakdown, feedback = calculate_score(
        merged_errors, 
        word_count
    )
    
    # Step 9: Generate diff HTML
    diff_html = generate_diff_html(cleaned_text, corrected_text)
    
    # Step 10: Set warning if error rate > 60%
    warning = None
    if word_count > 0 and (error_count / word_count) > 0.6:
        warning = "High error rate detected. Consider revising your text."
    
    # Step 11: Write to cache
    errors_json = [asdict(e) for e in merged_errors]
    await cache.set(
        cache_key=cache_key,
        corrected_text=corrected_text,
        errors_json=errors_json,
        error_breakdown=error_breakdown,
        score=score,
        grade=grade,
        feedback=feedback
    )
    
    # Step 12: Return result
    source_info = "languagetool+llm" if (lt_errors and llm_errors) else ("languagetool_only" if lt_errors else ("llm_only" if llm_errors else "no_errors"))
    logger.info(f"[PIPELINE] 📊 Pipeline complete - Source: {source_info}, Total errors: {error_count}, Fallback used: {fallback_used}")
    
    return PipelineResult(
        source="pipeline",
        corrected_text=corrected_text,
        errors=errors_json,
        score=score,
        grade=grade,
        word_count=word_count,
        error_count=error_count,
        error_breakdown=error_breakdown,
        feedback=feedback,
        fallback_used=fallback_used,
        warning=warning
    )
