"""
Test script to verify LLM response quality across all 7 Indian languages + English:
1. Tamil (ta)
2. Hindi (hi)
3. Telugu (te)
4. Marathi (mr)
5. Malayalam (ml)
6. Odia (or)
7. Bengali (bn)
8. English (en)
"""
import sys
import os
from pathlib import Path

# Force UTF-8 encoding for standard output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from services.llama_service import llama_service
from services.quiz_service import generate_quiz_questions

TEST_LANGUAGES = [
    ("ta", "Tamil"),
    ("hi", "Hindi"),
    ("te", "Telugu"),
    ("mr", "Marathi"),
    ("ml", "Malayalam"),
    ("or", "Odia"),
    ("bn", "Bengali"),
    ("en", "English"),
]

def run_tests():
    print("=" * 60)
    print("AARVA MULTILINGUAL LLM VERIFICATION SUITE")
    print("=" * 60)

    best_model = llama_service._get_best_model()
    print(f"[MODEL] Active Ollama Model: {best_model}")

    results = {}

    for code, name in TEST_LANGUAGES:
        print(f"\n--- Testing Language: {name} ({code}) ---")
        try:
            # 1. Test AI Tutor Chat
            chat_res = llama_service.chat_response(
                query="What is an Operating System?",
                language=name
            )
            response_text = chat_res.get("response", "").strip()
            print(f"[CHAT REPLY ({name})]:")
            preview = response_text[:180].replace("\n", " ") + ("..." if len(response_text) > 180 else "")
            print(preview)

            # 2. Test Quiz Generation
            quiz_res = generate_quiz_questions(
                textbook_id=None,
                topic="Operating Systems & Processes",
                num_questions=1,
                language=name
            )
            if quiz_res:
                q0 = quiz_res[0]
                print(f"[QUIZ QUESTION ({name})]: {q0.get('question')}")
                print(f"[QUIZ EXPLANATION ({name})]: {q0.get('explanation')}")

            results[name] = "PASS"
            print(f"Status: PASS for {name}")
        except Exception as e:
            results[name] = f"FAIL ({e})"
            print(f"Status: FAIL for {name}: {e}")

    print("\n" + "=" * 60)
    print("SUMMARY OF MULTILINGUAL VERIFICATION:")
    for lang, status in results.items():
        print(f"  • {lang:12}: {status}")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
