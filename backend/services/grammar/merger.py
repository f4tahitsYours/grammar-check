"""
Error merging and deduplication module.
Combines errors from rule-based and LLM sources.
"""

from backend.services.grammar.languagetool_client import RawError
from backend.models.response import NormalizedError


# Mapping from LanguageTool categories to internal error types
CATEGORY_MAP = {
    "GRAMMAR": "subject_verb",
    "TYPOS": "spelling",
    "PUNCTUATION": "punctuation",
    "CASING": "other",
    "COLLOCATIONS": "other",
    "CONFUSED_WORDS": "other",
    "REDUNDANCY": "other",
    "STYLE": "other",
    "TYPOGRAPHY": "punctuation",
    "MISC": "other",
}


def normalize_raw_error(raw: RawError) -> NormalizedError:
    """
    Convert RawError from LanguageTool to NormalizedError.
    
    Args:
        raw: RawError from LanguageTool
        
    Returns:
        NormalizedError with mapped error type
    """
    error_type = CATEGORY_MAP.get(raw.category, "other")
    
    return NormalizedError(
        original=raw.original,
        correction=raw.correction,
        error_type=error_type,
        explanation=raw.message,
        source="rule_based",
        offset=raw.offset
    )


def merge(
    lt_errors: list[RawError], 
    llm_errors: list[NormalizedError]
) -> list[NormalizedError]:
    """
    Merge and deduplicate errors from LanguageTool and LLM.
    
    Args:
        lt_errors: Raw errors from LanguageTool
        llm_errors: Normalized errors from LLM
        
    Returns:
        Unified list of NormalizedError objects
        
    Rules:
        - Convert RawError to NormalizedError using CATEGORY_MAP
        - Deduplicate by comparing 'original' field (case-insensitive)
        - Prefer rule_based version over llm version in case of duplicates
        - Return empty list if both inputs are empty
    """
    if not lt_errors and not llm_errors:
        return []
    
    # Normalize LanguageTool errors
    normalized_lt = [normalize_raw_error(error) for error in lt_errors]
    
    # Build set of original texts from rule-based errors (case-insensitive)
    lt_originals = {error.original.lower() for error in normalized_lt}
    
    # Filter LLM errors to remove duplicates
    unique_llm = [
        error for error in llm_errors 
        if error.original.lower() not in lt_originals
    ]
    
    # Combine: rule-based first, then unique LLM errors
    merged = normalized_lt + unique_llm
    
    return merged
