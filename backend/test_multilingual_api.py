"""
Automated Unit Test Suite for AARVA Multilingual API & Pydantic Validation.
Tests:
1. Pydantic schema validation for supported languages (en, ta, hi, te, mr, ml, or, bn).
2. Proper rejection of invalid / unsupported language inputs with ValueError / ValidationError.
3. Language normalization of native names and standard codes.
4. Multilingual summary request serialization.
"""

import sys
import unittest
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from pydantic import ValidationError
from schemas.language import (
    SUPPORTED_LANGUAGE_CODES,
    LANGUAGE_NAME_TO_CODE,
    normalize_language_code,
    is_valid_language,
    get_language_display_name,
)
from routes.summary import ChatMessageRequest
from routes.quiz import QuizGenerateRequest
from routes.students import PreferencesUpdate


class TestMultilingualPydanticValidation(unittest.TestCase):
    """Verifies that all 8 supported languages pass validation and unsupported inputs are rejected."""

    def test_all_eight_supported_languages_normalize_correctly(self):
        expected_mappings = {
            "en": "en",
            "english": "en",
            "ta": "ta",
            "tamil": "ta",
            "தமிழ்": "ta",
            "hi": "hi",
            "hindi": "hi",
            "हिन्दी": "hi",
            "te": "te",
            "telugu": "te",
            "తెలుగు": "te",
            "mr": "mr",
            "marathi": "mr",
            "मराठी": "mr",
            "ml": "ml",
            "malayalam": "ml",
            "മലയാളം": "ml",
            "or": "or",
            "odia": "or",
            "oriya": "or",
            "ଓଡ଼ିଆ": "or",
            "bn": "bn",
            "bengali": "bn",
            "bangla": "bn",
            "বাংলা": "bn",
        }
        for input_val, expected_code in expected_mappings.items():
            self.assertEqual(normalize_language_code(input_val), expected_code, f"Failed for {input_val}")

    def test_chat_message_request_valid_languages(self):
        valid_inputs = ["English", "Tamil", "தமிழ்", "ta", "Hindi", "hi", "Telugu", "te", "Marathi", "mr", "Malayalam", "ml", "Odia", "or", "Bengali", "bn"]
        for lang in valid_inputs:
            req = ChatMessageRequest(query="Explain TCP", language=lang)
            self.assertIsNotNone(req.language)
            self.assertTrue(len(req.language) > 0)

    def test_chat_message_request_invalid_language_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            ChatMessageRequest(query="Hello", language="Klingon")

    def test_quiz_generate_request_valid_languages(self):
        for code in ["en", "ta", "hi", "te", "mr", "ml", "or", "bn"]:
            req = QuizGenerateRequest(topic="Operating Systems", language=code)
            self.assertIsNotNone(req.language)

    def test_quiz_generate_request_invalid_language_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            QuizGenerateRequest(topic="Networks", language="Esperanto")

    def test_student_preferences_update_validation(self):
        req = PreferencesUpdate(preferred_language="Tamil")
        self.assertIn("Tamil", req.preferred_language)

        with self.assertRaises(ValidationError):
            PreferencesUpdate(preferred_language="Vulcan")

    def test_is_valid_language_helper(self):
        self.assertTrue(is_valid_language("ta"))
        self.assertTrue(is_valid_language("தமிழ்"))
        self.assertFalse(is_valid_language("invalid_lang"))


if __name__ == "__main__":
    unittest.main()
