"""
Scoring module for grammar checking results.
Supports dual scoring modes: Free Practice (Mode A) and Assignment Rubric (Mode B).
"""

from typing import List, Tuple
from pydantic import BaseModel

from backend.models.response import NormalizedError, RubricAutoScore


# ============================================================================
# MODE A: Free Practice Scoring Constants
# ============================================================================

WEIGHTS = {
    "tense": 3.0,
    "subject_verb": 2.5,
    "article": 1.5,
    "preposition": 1.5,
    "spelling": 1.0,
    "other": 1.0,
    "punctuation": 0.5,
}

GRADE_TABLE = [
    (90, "A"),
    (75, "B"),
    (60, "C"),
    (0, "D"),
]

FEEDBACK_MAP = {
    "tense": (
        "Focus on verb tenses. Pay attention to time markers "
        "like 'yesterday', 'tomorrow', 'already'."
    ),
    "subject_verb": (
        "Review subject-verb agreement rules, "
        "especially for third-person singular."
    ),
    "article": (
        "Practice using 'a', 'an', and 'the' correctly. "
        "Remember: 'a' before consonant sounds, "
        "'an' before vowel sounds."
    ),
    "preposition": (
        "Work on prepositions. Common ones: 'in', 'on', 'at', "
        "'for', 'with', 'by'. They are not directly translatable."
    ),
    "spelling": (
        "Check your spelling carefully. "
        "Use a dictionary or spellchecker before submitting."
    ),
    "punctuation": (
        "Review punctuation rules. Make sure sentences end with "
        "a period, question mark, or exclamation point."
    ),
    "other": (
        "Review your grammar fundamentals. "
        "Consider re-reading the chapter exercises."
    ),
}

NO_ERROR_FEEDBACK = "Excellent work! Your grammar is accurate."


# ============================================================================
# MODE A: Free Practice Scoring Functions
# ============================================================================

class ScoringResult(BaseModel):
    """Result model for Mode A scoring."""
    score: int
    grade: str
    error_breakdown: dict[str, int]
    feedback: str


def compute_error_breakdown(errors: List[NormalizedError]) -> dict[str, int]:
    """Compute error count by type."""
    breakdown = {}
    for error in errors:
        error_type = error.error_type
        breakdown[error_type] = breakdown.get(error_type, 0) + 1
    return breakdown


def assign_grade(score: int) -> str:
    """Assign letter grade based on score using GRADE_TABLE."""
    for threshold, letter in GRADE_TABLE:
        if score >= threshold:
            return letter
    return "D"


def generate_feedback(error_breakdown: dict[str, int]) -> str:
    """Generate feedback based on dominant error type."""
    if not error_breakdown:
        return NO_ERROR_FEEDBACK
    
    dominant_type = max(error_breakdown.items(), key=lambda x: x[1])[0]
    return FEEDBACK_MAP.get(dominant_type, FEEDBACK_MAP["other"])


def calculate_score(
    errors: List[NormalizedError], 
    word_count: int
) -> Tuple[int, str, dict[str, int], str]:
    """
    Calculate score and grade for free practice mode (Mode A).
    
    Args:
        errors: List of NormalizedError objects
        word_count: Total word count in text
        
    Returns:
        Tuple of (score, grade, error_breakdown, feedback)
        
    Formula:
        penalty = Σ (weight / word_count) × 100
        score = max(0, round(100 - penalty))
    """
    if word_count == 0:
        return 0, "D", {}, "No text provided."
    
    error_breakdown = compute_error_breakdown(errors)
    
    penalty = 0.0
    for error in errors:
        weight = WEIGHTS.get(error.error_type, 1.0)
        penalty += (weight / word_count) * 100
    
    raw_score = max(0, 100 - penalty)
    final_score = round(raw_score)
    grade = assign_grade(final_score)
    feedback = generate_feedback(error_breakdown)
    
    return final_score, grade, error_breakdown, feedback


# ============================================================================
# MODE B: Assignment Rubric Scoring Functions
# ============================================================================

GRAMMAR_ERROR_TYPES = {"tense", "subject_verb", "article", "preposition", "other"}
MECHANICS_ERROR_TYPES = {"spelling", "punctuation"}


def calculate_rubric_score(
    errors: List[NormalizedError],
    word_count: int,
    max_grammar: int = 5,
    max_mechanics: int = 5,
) -> RubricAutoScore:
    """
    Calculate rubric scores for assignment mode (Mode B).
    
    Args:
        errors: List of NormalizedError objects
        word_count: Total word count in text
        max_grammar: Maximum grammar score (default 5)
        max_mechanics: Maximum mechanics score (default 5)
        
    Returns:
        RubricAutoScore with score_grammar and score_mechanics
    """
    safe_word_count = max(word_count, 1)
    
    # Grammar score calculation
    grammar_errors = [e for e in errors if e.error_type in GRAMMAR_ERROR_TYPES]
    grammar_error_ratio = len(grammar_errors) / safe_word_count
    
    if len(grammar_errors) == 0:
        score_grammar = max_grammar
    elif grammar_error_ratio < 0.02:
        score_grammar = max_grammar - 1
    elif grammar_error_ratio < 0.05:
        score_grammar = max_grammar - 2
    elif grammar_error_ratio < 0.10:
        score_grammar = max_grammar - 3
    else:
        score_grammar = 1
    
    # Mechanics score calculation
    mechanics_errors = [e for e in errors if e.error_type in MECHANICS_ERROR_TYPES]
    mechanics_count = len(mechanics_errors)
    
    if mechanics_count == 0:
        score_mechanics = max_mechanics
    elif mechanics_count <= 3:
        score_mechanics = max_mechanics - 1
    elif mechanics_count <= 6:
        score_mechanics = max_mechanics - 2
    elif mechanics_count <= 9:
        score_mechanics = max_mechanics - 3
    else:
        score_mechanics = 1
    
    return RubricAutoScore(
        score_grammar=score_grammar,
        score_mechanics=score_mechanics
    )


def calculate_total_score(
    score_grammar: int,
    score_mechanics: int,
    score_content: int,
    score_unity: int,
    grading_scale: dict,
) -> Tuple[int, str]:
    """
    Calculate total score and grade for teacher review (Mode B).
    
    Args:
        score_grammar: Grammar score (1-5)
        score_mechanics: Mechanics score (1-5)
        score_content: Content score (1-5, manual from teacher)
        score_unity: Unity score (1-5, manual from teacher)
        grading_scale: Dict mapping threshold to grade letter
        
    Returns:
        Tuple of (total_score, grade)
        
    Example grading_scale:
        {"17": "A", "13": "B", "9": "C", "0": "D"}
    """
    total = score_grammar + score_mechanics + score_content + score_unity
    
    grade = "D"
    for threshold, letter in sorted(
        grading_scale.items(), 
        reverse=True, 
        key=lambda x: int(x[0])
    ):
        if total >= int(threshold):
            grade = letter
            break
    
    return total, grade
