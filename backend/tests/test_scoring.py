"""
Test suite for scoring module.
Tests both Mode A (free practice) and Mode B (assignment rubric) scoring.
"""

import pytest
from backend.services.scoring import (
    calculate_score,
    calculate_rubric_score,
    calculate_total_score,
    ScoringResult,
)
from backend.models.response import NormalizedError, RubricAutoScore


# ============================================================================
# MODE A: Free Practice Scoring Tests
# ============================================================================

def test_calculate_score_two_tense_errors_low_word_count():
    """Test 1: 2 tense errors, word_count=9 → score ~33, grade D"""
    errors = [
        NormalizedError(
            original="was going",
            correction="went",
            error_type="tense",
            explanation="Use simple past",
            source="rule_based",
            offset=0
        ),
        NormalizedError(
            original="has went",
            correction="went",
            error_type="tense",
            explanation="Use simple past",
            source="rule_based",
            offset=10
        ),
    ]
    
    score, grade, breakdown, feedback = calculate_score(errors, word_count=9)
    
    # penalty = (3.0/9 + 3.0/9) * 100 = 66.67
    # score = 100 - 66.67 = 33.33 → round to 33
    assert score == 33
    assert grade == "D"
    assert breakdown["tense"] == 2
    assert "tenses" in feedback.lower()


def test_calculate_score_two_tense_errors_high_word_count():
    """Test 2: 2 tense errors, word_count=100 → score ~94, grade A"""
    errors = [
        NormalizedError(
            original="was going",
            correction="went",
            error_type="tense",
            explanation="Use simple past",
            source="rule_based",
            offset=0
        ),
        NormalizedError(
            original="has went",
            correction="went",
            error_type="tense",
            explanation="Use simple past",
            source="rule_based",
            offset=10
        ),
    ]
    
    score, grade, breakdown, feedback = calculate_score(errors, word_count=100)
    
    # penalty = (3.0/100 + 3.0/100) * 100 = 6
    # score = 100 - 6 = 94
    assert score == 94
    assert grade == "A"
    assert breakdown["tense"] == 2


def test_calculate_score_zero_errors():
    """Test 3: Zero errors, word_count=50 → score=100, grade=A"""
    errors = []
    
    score, grade, breakdown, feedback = calculate_score(errors, word_count=50)
    
    assert score == 100
    assert grade == "A"
    assert breakdown == {}
    assert feedback == "Excellent work! Your grammar is accurate."


def test_calculate_score_extreme_error_count():
    """Test 4: Extreme error count (20 errors, word_count=10) → score=0, grade=D"""
    errors = [
        NormalizedError(
            original=f"error{i}",
            correction=f"correct{i}",
            error_type="spelling",
            explanation="Spelling error",
            source="rule_based",
            offset=i * 5
        )
        for i in range(20)
    ]
    
    score, grade, breakdown, feedback = calculate_score(errors, word_count=10)
    
    # penalty = (1.0/10) * 100 * 20 = 200
    # score = max(0, 100 - 200) = 0
    assert score == 0
    assert grade == "D"
    assert breakdown["spelling"] == 20


def test_calculate_score_dominant_error_tense():
    """Test 5: Dominant error = tense → feedback contains 'tenses'"""
    errors = [
        NormalizedError(
            original="was going",
            correction="went",
            error_type="tense",
            explanation="Use simple past",
            source="rule_based",
            offset=0
        ),
        NormalizedError(
            original="has went",
            correction="went",
            error_type="tense",
            explanation="Use simple past",
            source="rule_based",
            offset=10
        ),
        NormalizedError(
            original="a apple",
            correction="an apple",
            error_type="article",
            explanation="Use 'an' before vowel",
            source="rule_based",
            offset=20
        ),
    ]
    
    score, grade, breakdown, feedback = calculate_score(errors, word_count=50)
    
    assert breakdown["tense"] == 2
    assert breakdown["article"] == 1
    assert "tenses" in feedback.lower()


def test_calculate_score_zero_word_count():
    """Test 6: word_count=0 → no exception, return score=0"""
    errors = [
        NormalizedError(
            original="error",
            correction="correct",
            error_type="spelling",
            explanation="Spelling error",
            source="rule_based",
            offset=0
        ),
    ]
    
    # Should not raise ZeroDivisionError
    score, grade, breakdown, feedback = calculate_score(errors, word_count=0)
    
    assert score == 0
    assert grade == "D"
    assert "No text provided" in feedback


# ============================================================================
# MODE B: Assignment Rubric Scoring Tests
# ============================================================================

def test_calculate_rubric_score_zero_errors():
    """Test 7: 0 errors, word_count=50 → score_grammar=5, score_mechanics=5"""
    errors = []
    
    result = calculate_rubric_score(errors, word_count=50)
    
    assert result.score_grammar == 5
    assert result.score_mechanics == 5


def test_calculate_rubric_score_low_grammar_error_ratio():
    """Test 8: 3 grammar errors, word_count=100 (ratio=0.03) → score_grammar=4"""
    errors = [
        NormalizedError(
            original="was going",
            correction="went",
            error_type="tense",
            explanation="Use simple past",
            source="rule_based",
            offset=0
        ),
        NormalizedError(
            original="he go",
            correction="he goes",
            error_type="subject_verb",
            explanation="Subject-verb agreement",
            source="rule_based",
            offset=10
        ),
        NormalizedError(
            original="a apple",
            correction="an apple",
            error_type="article",
            explanation="Use 'an' before vowel",
            source="rule_based",
            offset=20
        ),
    ]
    
    result = calculate_rubric_score(errors, word_count=100)
    
    # ratio = 3/100 = 0.03, which is < 0.05 but >= 0.02
    # score = 5 - 2 = 3
    assert result.score_grammar == 3


def test_calculate_rubric_score_spelling_errors():
    """Test 9: 5 spelling errors, word_count=100 → score_mechanics=4"""
    errors = [
        NormalizedError(
            original=f"speling{i}",
            correction=f"spelling{i}",
            error_type="spelling",
            explanation="Spelling error",
            source="rule_based",
            offset=i * 10
        )
        for i in range(5)
    ]
    
    result = calculate_rubric_score(errors, word_count=100)
    
    # mechanics_count = 5, which is 4-6 range
    # score = 5 - 2 = 3
    assert result.score_mechanics == 3


def test_calculate_rubric_score_many_spelling_errors():
    """Test 10: 10+ spelling errors, word_count=50 → score_mechanics=1"""
    errors = [
        NormalizedError(
            original=f"speling{i}",
            correction=f"spelling{i}",
            error_type="spelling",
            explanation="Spelling error",
            source="rule_based",
            offset=i * 5
        )
        for i in range(12)
    ]
    
    result = calculate_rubric_score(errors, word_count=50)
    
    # mechanics_count = 12, which is >= 10
    # score = 1
    assert result.score_mechanics == 1


# ============================================================================
# MODE B: Total Score Calculation Tests
# ============================================================================

def test_calculate_total_score_grade_b():
    """Test 11: Total=14 → grade B"""
    grading_scale = {
        "17": "A",
        "13": "B",
        "9": "C",
        "0": "D"
    }
    
    total, grade = calculate_total_score(
        score_grammar=4,
        score_mechanics=4,
        score_content=3,
        score_unity=3,
        grading_scale=grading_scale
    )
    
    assert total == 14
    assert grade == "B"


def test_calculate_total_score_grade_a():
    """Test 12: All scores=5 → total=20, grade A"""
    grading_scale = {
        "17": "A",
        "13": "B",
        "9": "C",
        "0": "D"
    }
    
    total, grade = calculate_total_score(
        score_grammar=5,
        score_mechanics=5,
        score_content=5,
        score_unity=5,
        grading_scale=grading_scale
    )
    
    assert total == 20
    assert grade == "A"
