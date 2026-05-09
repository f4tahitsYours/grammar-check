"""
Text preprocessing module for grammar pipeline.
Normalizes and cleans input text before grammar checking.
"""

import re
import unicodedata
from typing import Optional


def preprocess(text: Optional[str]) -> str:
    """
    Preprocess input text with normalization and cleaning.
    
    Args:
        text: Raw input text from user
        
    Returns:
        Cleaned and normalized text string
        
    Rules:
        - Never raises exceptions
        - Returns empty string for None or empty input
        - Applies unicode normalization, whitespace cleanup, and sentence capitalization
    """
    if not text:
        return ""
    
    try:
        # Step 1: Unicode normalization to NFKC form
        normalized = unicodedata.normalize('NFKC', text)
        
        # Step 2: Remove non-printable characters outside ASCII 0x20-0x7E
        printable = ''.join(
            char for char in normalized 
            if ord(char) >= 0x20 and ord(char) <= 0x7E or char in '\n\r\t'
        )
        
        # Step 3: Strip multiple whitespace to single space
        cleaned = re.sub(r'\s+', ' ', printable)
        cleaned = cleaned.strip()
        
        # Step 4: Auto-capitalize first letter of each sentence
        sentences = cleaned.split('. ')
        capitalized_sentences = [
            sentence[0].upper() + sentence[1:] if sentence else sentence
            for sentence in sentences
        ]
        result = '. '.join(capitalized_sentences)
        
        return result
        
    except Exception:
        # Fail gracefully - return empty string on any error
        return ""
