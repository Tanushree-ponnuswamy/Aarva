"""
Pydantic Language Validation Schema for AARVA.
Strictly validates and normalizes the 8 supported languages:
- English (en)
- Tamil (ta)
- Hindi (hi)
- Telugu (te)
- Marathi (mr)
- Malayalam (ml)
- Odia (or)
- Bengali (bn)
"""

from typing import Optional, Literal
from pydantic import BaseModel, validator

SUPPORTED_LANGUAGE_CODES = {
    "en": "English",
    "ta": "Tamil (தமிழ்)",
    "hi": "Hindi (हिन्दी)",
    "te": "Telugu (తెలుగు)",
    "mr": "Marathi (मराठी)",
    "ml": "Malayalam (മലയാളം)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "bn": "Bengali (বাংলা)",
}

LANGUAGE_NAME_TO_CODE = {
    # English
    "english": "en", "en": "en",
    # Tamil
    "tamil": "ta", "தமிழ்": "ta", "ta": "ta",
    # Hindi
    "hindi": "hi", "हिन्दी": "hi", "हिंदी": "hi", "hi": "hi",
    # Telugu
    "telugu": "te", "తెలుగు": "te", "te": "te",
    # Marathi
    "marathi": "mr", "मराठी": "mr", "mr": "mr",
    # Malayalam
    "malayalam": "ml", "മലയാളം": "ml", "ml": "ml",
    # Odia
    "odia": "or", "oriya": "or", "ଓଡ଼ିଆ": "or", "or": "or",
    # Bengali
    "bengali": "bn", "bangla": "bn", "বাংলা": "bn", "bn": "bn",
}

def normalize_language_code(val: Optional[str]) -> str:
    """Normalizes any valid language name or code to its standard 2-letter code."""
    if not val:
        return "en"
    cleaned = val.strip().lower()
    return LANGUAGE_NAME_TO_CODE.get(cleaned, "en")

def is_valid_language(val: Optional[str]) -> bool:
    """Checks whether the provided language is among the 8 supported languages."""
    if not val:
        return True
    cleaned = val.strip().lower()
    return cleaned in LANGUAGE_NAME_TO_CODE or cleaned in SUPPORTED_LANGUAGE_CODES

def get_language_display_name(code: str) -> str:
    """Returns the display name with native script for a 2-letter code."""
    norm = normalize_language_code(code)
    return SUPPORTED_LANGUAGE_CODES.get(norm, "English")
