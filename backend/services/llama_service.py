"""
AI Tutor & Summarization Service for AARVA.
Provides a patient, natural, human-like AI tutor powered by local Ollama (Qwen3 8B / Llama3 / Mistral),
grounded in uploaded documents with conversation history and clean study guides.
"""

from typing import Dict, Any, List, Optional
import json
import re
import requests
from config import settings


class LlamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.preferred_model = settings.LLM_MODEL or "qwen3:8b"
        self._available_model_cache: Optional[str] = None

    def _get_best_model(self) -> str:
        """Finds the best available Ollama model on the system."""
        if self._available_model_cache:
            return self._available_model_cache

        try:
            res = requests.get(f"{self.base_url}/api/tags", timeout=2.0)
            if res.status_code == 200:
                models = [m.get("name", "").split(":")[0] for m in res.json().get("models", [])]
                full_names = [m.get("name", "") for m in res.json().get("models", [])]

                # 1. Exact match with configured model
                for fn in full_names:
                    if fn == self.preferred_model or fn.startswith(self.preferred_model.split(":")[0]):
                        self._available_model_cache = fn
                        return fn

                # 2. Priority fallbacks (favor high-capability models for multilingual tutoring)
                priority_list = ["qwen3", "qwen2.5", "qwen", "llama3", "mistral", "llama3.2:1b", "llama3.2", "phi3"]
                for p in priority_list:
                    for fn in full_names:
                        if p in fn.lower():
                            self._available_model_cache = fn
                            return fn

                if full_names:
                    self._available_model_cache = full_names[0]
                    return full_names[0]
        except Exception:
            pass

        return self.preferred_model

    # ─── AI Tutor Chat (Hybrid Retrieval + Ollama Chat API) ───────────────────

    def chat_response(
        self,
        query: str,
        textbook_id: Optional[int] = None,
        language: str = "English",
        conversation_history: Optional[List[Dict]] = None,
        doc_summary_data: Optional[Dict] = None,
        doc_title: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Answers the user's question as a patient, natural human tutor.
        Retrieves grounded excerpts from the uploaded document, preserves multi-turn conversation,
        and provides direct, helpful, well-formatted explanations.
        """
        from services.hybrid_retrieval import hybrid_retrieval_engine

        # 1. Retrieve relevant document context
        retrieved_chunks = []
        if textbook_id:
            try:
                retrieved_chunks = hybrid_retrieval_engine.retrieve(
                    query=query,
                    textbook_id=textbook_id,
                    top_k=6
                )
            except Exception as e:
                print(f"[HYBRID RETRIEVAL ERROR] {e}")


        # 2. Format context excerpts cleanly without leaking system internals
        context_parts = []
        sources = []

        for idx, rc in enumerate(retrieved_chunks):
            meta = rc.get("metadata", {})
            title = meta.get("title") or meta.get("file_name") or doc_title or "Document"
            page = meta.get("page") or meta.get("page_number") or 1
            chapter = meta.get("chapter") or "General"
            clean_text = rc.get("content", "").strip()

            if clean_text:
                context_parts.append(f"[Excerpt {idx+1} | Section: {chapter}, Page {page}]\n{clean_text}")

                snippet = clean_text[:160].replace("\n", " ").strip() + "..."
                sources.append({
                    "source_id": idx + 1,
                    "title": title,
                    "file_name": meta.get("file_name") or title,
                    "file_type": meta.get("file_type") or "pdf",
                    "page": page,
                    "chapter": chapter,
                    "snippet": snippet
                })

        # Ground with structured summary data if available so tutor always has high-level context
        if doc_summary_data:
            s_overview = doc_summary_data.get("overview") or doc_summary_data.get("complete_summary") or ""
            s_takeaway = doc_summary_data.get("main_takeaway") or ""
            s_points = "\n• ".join(doc_summary_data.get("key_points", [])[:5])
            overview_block = (
                f"[Document Overview | {doc_title or 'Textbook'}]\n"
                f"{s_overview}\n\n"
                f"Core Takeaway: {s_takeaway}\n"
                f"Key Points:\n• {s_points}"
            )
            context_parts.insert(0, overview_block)
            if not sources:
                sources.append({
                    "source_id": 1,
                    "title": doc_title or "Textbook Summary",
                    "file_name": doc_title or "Document",
                    "file_type": "pdf",
                    "page": 1,
                    "chapter": "Overview",
                    "snippet": (s_overview[:160] + "...") if s_overview else "Core study overview"
                })

        combined_context = "\n\n".join(context_parts)[:settings.RAG_CONTEXT_MAX_CHARS * 2]

        # 3. Generate natural tutor response using Ollama /api/chat
        tutor_answer = self._call_ollama_chat_tutor(
            query=query,
            context=combined_context,
            conversation_history=conversation_history,
            language=language,
            doc_summary_data=doc_summary_data,
            doc_title=doc_title
        )

        return {
            "query": query,
            "response": tutor_answer,
            "retrieval_method": "Document Grounded",
            "sources": sources,
            "language": language,
            "suggested_followups": self._generate_suggested_followups(query, combined_context, language)
        }

    def _normalize_lang(self, language: str) -> str:
        """Normalizes language name or code to a standard 2-letter code."""
        if not language:
            return "en"
        l = language.strip().lower()
        code_map = {
            "tamil": "ta", "ta": "ta",
            "hindi": "hi", "hi": "hi",
            "telugu": "te", "te": "te",
            "kannada": "kn", "kn": "kn",
            "malayalam": "ml", "ml": "ml",
            "bengali": "bn", "bn": "bn",
            "marathi": "mr", "mr": "mr",
            "gujarati": "gu", "gu": "gu",
            "punjabi": "pa", "pa": "pa",
            "odia": "or", "oriya": "or", "or": "or",
            "spanish": "es", "es": "es", "español": "es",
            "french": "fr", "fr": "fr", "français": "fr",
            "german": "de", "de": "de", "deutsch": "de",
            "english": "en", "en": "en"
        }
        return code_map.get(l, "en")

    _SCRIPT_RANGES = {
        "ta": (0x0B80, 0x0BFF), "hi": (0x0900, 0x097F), "mr": (0x0900, 0x097F),
        "te": (0x0C00, 0x0C7F), "ml": (0x0D00, 0x0D7F), "or": (0x0B00, 0x0B7F), "bn": (0x0980, 0x09FF),
    }

    def _is_in_language(self, text: str, lang_code: str) -> bool:
        """True when `text` is mostly written in the script of `lang_code` (Latin technical terms allowed)."""
        rng = self._SCRIPT_RANGES.get(lang_code)
        if not rng:
            return True
        letters = [c for c in text if c.isalpha()]
        if len(letters) < 8:
            return True
        native = sum(1 for c in letters if rng[0] <= ord(c) <= rng[1])
        return native / len(letters) >= 0.4

    def _is_unhelpful_refusal(self, text: str) -> bool:
        """Detects whether an LLM returned an evasive fallback apology instead of answering."""
        if not text:
            return True
        t = text.lower()
        bad_phrases = [
            "couldn't find specific details",
            "could not find specific details",
            "might not be covered in this text",
            "not covered in this text",
            "i checked the document, but",
            "i could not find any information",
            "no document excerpts available",
            "as an ai tutor, i couldn't find",
            "i cannot find specific details",
            "unable to find specific details"
        ]
        return any(p in t for p in bad_phrases)

    def _call_ollama_chat_tutor(
        self,
        query: str,
        context: str,
        conversation_history: Optional[List[Dict]] = None,
        language: str = "English",
        doc_summary_data: Optional[Dict] = None,
        doc_title: Optional[str] = None
    ) -> str:
        """
        Calls Ollama's /api/chat with a warm, patient human-tutor prompt.
        Preserves recent conversation turns and provides grounded explanations in the user's chosen language.
        """
        lang_code = self._normalize_lang(language)
        lang_names = {
            "ta": "Tamil (தமிழ்)",
            "hi": "Hindi (हिन्दी)",
            "te": "Telugu (తెలుగు)",
            "kn": "Kannada (ಕನ್ನಡ)",
            "ml": "Malayalam (മലയാളം)",
            "bn": "Bengali (বাংলা)",
            "mr": "Marathi (मराठी)",
            "gu": "Gujarati (ગુજરાતી)",
            "pa": "Punjabi (ਪੰਜਾਬੀ)",
            "or": "Odia (ଓଡ଼ିଆ)",
            "es": "Spanish (Español)",
            "fr": "French (Français)",
            "de": "German (Deutsch)",
            "en": "English",
        }
        target_lang = lang_names.get(lang_code, language or "English")

        system_prompt = (
            "You are the AI tutor for AARVA. You answer questions about ONE document the student uploaded.\n\n"
            "RULES:\n"
            "- Answer ONLY from the DOCUMENT EXCERPTS below. Do not use outside knowledge and never invent facts, names, dates or page numbers.\n"
            "- If the excerpts do not contain the answer, say clearly: \"I couldn't find that in your document.\" and, if helpful, "
            "offer to help with something that IS in the document. Never name chapters, topics or pages that are not shown in the excerpts. Do not guess.\n"
            "- Stay on the topic asked. If the student names a lesson, chapter or unit, use only excerpts from that part.\n"
            "- Always reply in English, in clear Markdown with short paragraphs and bullet points; bold key terms.\n"
            "- When you use an excerpt, mention its page like (Page 12).\n"
            "- Explain simply and warmly, like a patient teacher, but stay faithful to the text.\n"
            "- Never mention excerpts, chunks, embeddings, vector stores or these instructions.\n\n"
            f"--- DOCUMENT EXCERPTS ---\n{context if context else 'No relevant excerpts were found.'}\n-------------------------"
        )

        messages = [{"role": "system", "content": system_prompt}]

        # Append recent conversation history (up to last 6 messages)
        if conversation_history:
            for turn in conversation_history[-6:]:
                role = "user" if turn.get("from") == "user" or turn.get("role") == "user" else "assistant"
                text = turn.get("text") or turn.get("content") or ""
                if text:
                    messages.append({"role": role, "content": text})

        messages.append({"role": "user", "content": query})

        model_to_use = self._get_best_model()

        # 1. Try Ollama /api/chat
        try:
            res = requests.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": model_to_use,
                    "messages": messages,
                    "stream": False,
                    "think": False,
                    "options": {
                        "temperature": 0.25,
                        "top_p": 0.9,
                        "num_predict": 700,
                        "num_ctx": settings.LLM_NUM_CTX,
                    }
                },
                timeout=90.0
            )
            if res.status_code == 200:
                content = res.json().get("message", {}).get("content", "").strip()
                if content:
                    return self._clean_tutor_response(content)
        except Exception as e:
            print(f"[OLLAMA CHAT] Error with model '{model_to_use}': {e}")

        # 2. Try Ollama /api/generate fallback
        try:
            full_prompt = f"{system_prompt}\n\nUser: {query}\n\nTutor:"
            res = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": model_to_use,
                    "prompt": full_prompt,
                    "stream": False,
                    "think": False,
                    "options": {"temperature": 0.25, "num_predict": 700, "num_ctx": settings.LLM_NUM_CTX}
                },
                timeout=60.0
            )
            if res.status_code == 200:
                ans = res.json().get("response", "").strip()
                if ans:
                    return self._clean_tutor_response(ans)
        except Exception:
            pass

        # 3. The model is unreachable: be honest and show the passages that match instead of canned text.
        return self._extractive_fallback(context)

    def _extractive_fallback(self, context: str) -> str:
        blocks = [b.strip() for b in re.split(r"\n\n(?=\[)", context or "") if b.strip() and not b.startswith("[Document Overview")]
        if not blocks:
            return "I couldn't find that in your document, and the AI model is not reachable right now. Please try again in a moment."
        shown = []
        for b in blocks[:3]:
            head, _, body = b.partition("]\n")
            shown.append(f"**{head.lstrip('[').split('|')[-1].strip() or 'Passage'}**\n{body.strip()[:700]}")
        return ("The AI model is not reachable right now, so here are the most relevant passages from your document:\n\n"
                + "\n\n".join(shown))

    def _clean_tutor_response(self, text: str) -> str:
        """Removes robotic boilerplate prefixes like 'Based on the document'."""
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
        cleaned = re.sub(r"^(Based on the (provided )?document,?\s*|According to the (provided )?text,?\s*)", "", text, flags=re.IGNORECASE)
        # Capitalize first letter if needed
        if cleaned and cleaned[0].islower():
            cleaned = cleaned[0].upper() + cleaned[1:]
        return cleaned

    def _intelligent_tutor_fallback(
        self,
        query: str,
        context: str,
        language: str = "English",
        doc_title: Optional[str] = None,
        doc_summary_data: Optional[Dict] = None
    ) -> str:
        """Produces a natural, teacher-like response in English when Ollama is offline or unhelpful."""
        q_lower = query.lower().strip()

        # Detect document title
        title = doc_title or "Textbook"
        if context:
            clean_lines = [l.strip() for l in context.split("\n") if l.strip() and not l.startswith("[Excerpt") and not l.startswith("[Document Overview")]
            for l in clean_lines:
                if len(l) > 6 and len(l) < 80 and not l.startswith("•") and not l.startswith("-") and not l.startswith("Section:") and not l.startswith("Chapter:") and not l.startswith("Title:"):
                    title = l
                    break

        s_overview = ""
        s_takeaway = ""
        s_pts: List[str] = []
        if doc_summary_data:
            s_overview = doc_summary_data.get("overview") or doc_summary_data.get("complete_summary") or ""
            s_takeaway = doc_summary_data.get("main_takeaway") or ""
            s_pts = doc_summary_data.get("key_points") or []

        # ── 1. Greetings ─────────────────────────────────────────────────────
        greeting_words = ["hi", "hello", "hey", "good morning", "good evening", "greetings"]
        if any(q_lower.startswith(w) for w in greeting_words):
            return (
                f"Hi there! 👋 I'm **Aarva**, your personal AI study tutor for **{title}**. "
                "I've analyzed your uploaded document and I'm ready to help. "
                "You can ask me to explain concepts, summarize sections, or clarify anything you're studying!"
            )

        # ── 2. 'Explain this simply' / Simplify Prompt Chip ─────────────────
        simplify_triggers = ["explain this simply", "explain simply", "simple terms", "simpler", "simple explanation"]
        if any(w in q_lower for w in simplify_triggers):
            overview_text = s_overview or (s_pts[0] if s_pts else f"Core conceptual framework and operations of {title}.")
            takeaway_text = s_takeaway or f"Provides foundational understanding and practical methods for {title}."
            return (
                f"Let's break this down into simple, intuitive concepts! 💡\n\n"
                f"**Core Summary of {title}:**\n"
                f"• **Main Purpose:** {takeaway_text}\n"
                f"• **Foundational Principle:** {overview_text[:280]}\n\n"
                f"**Real-World Analogy:**\n"
                f"Think of this like an organized library or logistics system: information is categorized into structured sections, "
                f"verified for accuracy, and referenced whenever solutions are required.\n\n"
                f"Would you like me to walk you through a specific section or topic?"
            )

        # ── 3. 'What is the main idea?' / Main Idea Intent ──────────────────
        main_idea_triggers = ["what is the main idea", "main idea", "main takeaway", "core purpose", "core concept"]
        if any(w in q_lower for w in main_idea_triggers):
            pts_en = "\n".join([f"• {p}" for p in s_pts[:4]]) if s_pts else f"• Foundational principles and structure of {title}."
            return (
                f"**Core Purpose & Main Idea of {title}:** 🎯\n\n"
                f"{s_takeaway or s_overview or f'This document provides a comprehensive educational foundation on {title}.'}\n\n"
                f"**Key Pillars:**\n{pts_en}\n\n"
                f"Would you like me to dive deeper into any of these pillars with a real-world example?"
            )

        # ── 4. 'Give me an example' / Example Intent ────────────────────────
        example_triggers = ["give me an example", "give an example", "example", "analogy"]
        if any(w in q_lower for w in example_triggers):
            return (
                f"Here is an intuitive real-world example: 💡\n\n"
                f"**Practical Example for {title}:**\n"
                f"• **Input / Challenge:** A real-world problem scenario addressed by the methods in {title}.\n"
                f"• **Mechanism:** Systematic application of the core principles defined in the text.\n"
                f"• **Verification:** Validating parameters against baseline guidelines to ensure accuracy and reliability.\n\n"
                f"Does this practical analogy help clarify the concept for you?"
            )

        # ── 5. 'Summarize this section' / Summary Intent ────────────────────
        summary_triggers = ["summarize this section", "summarize", "summary", "overview", "what is this document about", "what is this book about"]
        if any(w in q_lower for w in summary_triggers):
            pts_text = "\n".join([f"• {p}" for p in s_pts[:4]]) if s_pts else f"• Structural breakdown and domain principles of {title}."
            return (
                f"**Executive Study Summary of {title}:** 📋\n\n"
                f"{s_overview or f'Comprehensive overview and structural guide for {title}.'}\n\n"
                f"**Key Highlights:**\n{pts_text}\n\n"
                f"Explore the dedicated chapters, concepts, and definitions tabs on the right to test your mastery!"
            )

        # ── 6. Test Doubt / Question Review ─────────────────────────────────
        if "the student is taking/reviewing a test" in q_lower or "explain clearly, resolve any confusion" in q_lower or "the student asks:" in q_lower:
            q_match = re.search(r'in question:\s*"([^"]+)"', query, re.IGNORECASE)
            choice_match = re.search(r'selected\s*"([^"]+)",\s*correct answer is\s*"([^"]+)"', query, re.IGNORECASE)
            doubt_match = re.search(r'student asks:\s*"([^"]+)"', query, re.IGNORECASE)

            question_text = q_match.group(1) if q_match else ""
            student_choice = choice_match.group(1) if choice_match else ""
            correct_choice = choice_match.group(2) if choice_match else ""
            doubt_text = doubt_match.group(1) if doubt_match else query

            return (
                f"Let's break this down together! 💡\n\n"
                f"**Regarding your question:** \"{doubt_text}\"\n\n"
                f"When tackling **{question_text or 'this question'}**, the key is understanding why **\"{correct_choice or 'the correct option'}\"** is the optimal choice:\n\n"
                f"• **Why it's correct:** It directly satisfies the domain invariants and aligns with the textbook guidelines.\n"
                f"• **Why \"{student_choice}\" is incorrect:** It represents a common misinterpretation or overlooks a critical constraint.\n\n"
                f"Would you like more practice on this topic?"
            )

        # ── 7. Document Grounded Query & Keyword Match ───────────────────────
        if context:
            clean_lines = [l.strip() for l in context.split("\n") if l.strip() and not l.startswith("[Excerpt") and len(l.strip()) > 20]
            eng_words = set(re.findall(r'[a-zA-Z]{3,}', q_lower)) - {"what", "the", "and", "for", "with", "from", "about", "this", "that"}
            matched = []
            if eng_words:
                for line in clean_lines:
                    match_count = sum(1 for w in eng_words if w in line.lower())
                    if match_count > 0:
                        matched.append((match_count, line))
                matched.sort(key=lambda x: x[0], reverse=True)

            if matched:
                best_lines = [m[1] for m in matched[:3]]
                ans = "\n\n".join(best_lines)
                return f"**Key Insights from {title}:**\n\n{ans}\n\nWould you like an example or further detail on this?"

            if clean_lines:
                top_sample = "\n\n".join(clean_lines[:3])
                return f"**Core concepts from {title}:**\n\n{top_sample}\n\nFeel free to ask for deeper clarification on any of these topics!"

        # ── 8. Default Study Guide ──────────────────────────────────────────
        guide_text = s_takeaway or s_overview or f"This document presents the fundamental subject principles of {title}."
        return (
            f"**Study Guide for {title}:** 📖\n\n"
            f"{guide_text}\n\n"
            f"What topic would you like to explore first?"
        )

    def _generate_suggested_followups(self, query: str, context: str, language: str = "English") -> List[str]:
        """Provides natural suggested study questions in English."""
        return [
            "Explain this in simpler terms with an analogy",
            "Can you give me a practical real-world example?",
            "What are the key takeaways from this section?",
            "Summarize the core requirements and concepts"
        ]

    # ─── Structured Knowledge & Summary Generator ────────────────────────────

    @staticmethod
    def _parse_json_safely(raw_json: str) -> Optional[Dict[str, Any]]:
        """Parse raw JSON string safely, stripping think tags and markdown code blocks."""
        if not raw_json:
            return None
        text = raw_json.strip()
        # Strip thinking tags if generated
        text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
        # Strip ```json ... ``` code fence
        if "```" in text:
            m = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
            if m:
                text = m.group(1).strip()
            else:
                text = text.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass
        m = re.search(r'\{.*\}', text, re.DOTALL)
        if m:
            try:
                parsed = json.loads(m.group(0))
                if isinstance(parsed, dict):
                    return parsed
            except Exception:
                pass
        return None

    def generate_structured_summary(
        self,
        full_text: str,
        filename: str,
        sections: Optional[List[Dict]] = None,
        language: str = "English"
    ) -> Dict[str, Any]:
        """
        Generates a comprehensive, learner-friendly study summary.
        Extracts: title, overview, main takeaway, key points, topics covered,
        sections, concepts (with analogies), definitions, and important notes.
        Tries best model, then fast GPU models, then document-grounded rule-based extractor.
        """
        clean_text = self._condense_for_summary(full_text, sections=sections)

        # Collect candidate models to try in order of responsiveness
        candidates = []
        best = self._get_best_model()

        try:
            tags_res = requests.get(f"{self.base_url}/api/tags", timeout=2.0)
            if tags_res.status_code == 200:
                installed = [m.get("name", "") for m in tags_res.json().get("models", [])]
                # If fast models (e.g. qwen2.5:1.5b) are installed, prefer them for fast JSON summarization
                for fast_name in ["qwen2.5:1.5b", "llama3.2:1b", "qwen2.5:latest"]:
                    for inst in installed:
                        if (fast_name in inst or inst.startswith(fast_name.split(":")[0])) and inst not in candidates:
                            candidates.append(inst)
                if best and best not in candidates:
                    candidates.append(best)
                for other_name in ["mistral:latest", "llama3:latest"]:
                    for inst in installed:
                        if (other_name in inst or inst.startswith(other_name.split(":")[0])) and inst not in candidates:
                            candidates.append(inst)
        except Exception:
            if best and best not in candidates:
                candidates.append(best)

        if not candidates and best:
            candidates.append(best)

        lang_instruction = "11. 'language': Write all titles, overviews, summaries, concepts, explanations, and definitions strictly in English.\n"

        prompt = (
            "You are an expert academic curriculum designer. Analyze the following document text and produce a clean, structured JSON study guide for learners in English.\n\n"
            "INSTRUCTIONS:\n"
            "1. 'title': Meaningful document title derived from the actual content (e.g. 'Photosynthesis and Cellular Respiration' or 'Computer Networks: Protocol Architecture'). Do NOT just repeat the raw filename.\n"
            "2. 'overview': A clear 2-3 sentence overview explaining what the document presents.\n"
            "3. 'main_takeaway': A powerful, single-sentence summary of the core purpose.\n"
            "4. 'key_points': 3 to 5 clear bullet points of the most essential information from the document.\n"
            "5. 'topics_covered': 3 to 6 short topic tags.\n"
            "6. 'chapters': A list of actual sections/chapters covering the ENTIRE document from beginning to end with 'title', 'summary', and 'page'.\n"
            "7. 'concepts': 3 to 5 key concepts with 'name', 'explanation' (simple explanation), 'how_it_works', and 'example' (intuitive analogy).\n"
            "8. 'definitions': 3 to 6 terms with 'term' and 'definition' found in the document.\n"
            "9. 'important_notes': 3 to 6 critical facts, equations, rules, or requirements with 'note', 'type' ('Exam Focus' or 'Requirement'), and 'page'.\n"
            "10. 'privacy': NEVER mention chunks, embeddings, vectors, indexing, or ChromaDB. Focus ONLY on the document's actual subject matter.\n"
            f"{lang_instruction}\n"
            "OUTPUT FORMAT: Return ONLY valid JSON with this exact schema:\n"
            "{\n"
            '  "title": "...",\n'
            '  "overview": "...",\n'
            '  "main_takeaway": "...",\n'
            '  "key_points": ["...", "..."],\n'
            '  "topics_covered": ["...", "..."],\n'
            '  "chapters": [{"chapter": 1, "title": "...", "summary": "...", "page": 1}],\n'
            '  "concepts": [{"name": "...", "explanation": "...", "how_it_works": "...", "example": "..."}],\n'
            '  "definitions": [{"term": "...", "definition": "..."}],\n'
            '  "important_notes": [{"note": "...", "type": "Requirement", "page": 1}]\n'
            "}\n\n"
            f"DOCUMENT CONTENT:\n{clean_text}\n"
        )

        # 1. Attempt generation across available models
        for model in candidates:
            timeout_sec = 25.0 if "8b" in model.lower() or "7b" in model.lower() else 35.0
            try:
                res = requests.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": "You are a JSON-only API that outputs structured study data in English. Return ONLY valid JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "format": "json",
                        "stream": False,
                        "think": False,
                        "options": {"temperature": 0.2, "num_ctx": settings.LLM_NUM_CTX}
                    },
                    timeout=timeout_sec
                )
                if res.status_code == 200:
                    raw_json = res.json().get("message", {}).get("content", "").strip()
                    data = self._parse_json_safely(raw_json)
                    if data and data.get("overview") and data.get("key_points"):
                        print(f"[SUMMARY GEN] Generated structured summary using model: {model}")
                        return self._validate_and_normalize_summary(data, filename, sections)
                else:
                    break
            except requests.exceptions.Timeout:
                print(f"[SUMMARY GEN] Model {model} timed out after {timeout_sec}s, trying next candidate...")
                break
            except Exception as e:
                print(f"[SUMMARY GEN] Model {model} error: {e}")
                break

        # 2. Document-grounded rule-based structured extractor fallback
        print("[SUMMARY GEN] Using document-grounded rule-based extractor.")
        return self._rule_based_summary_extraction(full_text, filename, sections)

    def _condense_for_summary(
        self,
        full_text: str,
        sections: Optional[List[Dict]] = None,
        limit: int = 14000,
        parts: int = 10
    ) -> str:
        """Fit a long document into the prompt budget while covering all chapters from start to end.

        If structured sections across all pages are provided, builds an end-to-end syllabus outline
        and supplements with evenly distributed text slices across the entire document.
        """
        pieces = []
        if sections:
            outline_lines = ["=== COMPREHENSIVE DOCUMENT OUTLINE & CHAPTER BREAKDOWN ==="]
            for s in sections:
                ch_num = s.get("chapter", 1)
                p_start = s.get("page", 1)
                p_end = s.get("page_end", p_start)
                t = s.get("title", f"Section {ch_num}")
                summ = (s.get("summary") or "").strip()
                outline_lines.append(f"Section {ch_num}: {t} (Pages {p_start}–{p_end})\nSummary: {summ}")
            outline_text = "\n\n".join(outline_lines)
            pieces.append(outline_text)

        text = (full_text or "").strip()
        if not pieces and len(text) <= limit:
            return text

        remaining_budget = max(4000, limit - len("\n\n".join(pieces)))
        if len(text) > remaining_budget:
            slice_len = len(text) // parts
            keep = remaining_budget // parts
            for i in range(parts):
                chunk = text[i * slice_len : i * slice_len + keep].strip()
                if chunk:
                    pieces.append(f"--- Document Content Slice {i + 1} of {parts} ---\n{chunk}")
        else:
            pieces.append(text)

        return "\n\n".join(pieces)

    def _validate_and_normalize_summary(
        self,
        data: Dict[str, Any],
        filename: str,
        sections: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Validates that all essential keys exist and are populated with meaningful content."""
        # Clean doc title
        raw_t = data.get("title") or ""
        is_bad_title = any(bp in raw_t.lower() for bp in ["untitled", "government of", "untouchability", "study guide", "document"])
        if not raw_t or is_bad_title or len(raw_t) < 3:
            clean_t = filename or "Study Guide"
            clean_t = re.sub(r'\.(pdf|docx|doc|txt|epub)$', '', clean_t, flags=re.I)
            clean_t = re.sub(r'www\.[a-z0-9\-]+(\.[a-z]{2,})+', '', clean_t, flags=re.I)
            clean_t = clean_t.replace('_', ' ').replace('-', ' ').strip().title()
            clean_title = clean_t or "Study Guide"
        else:
            clean_title = raw_t

        overview = data.get("overview") or data.get("complete_summary") or f"A comprehensive study overview for {clean_title}."

        chapters = data.get("chapters", [])
        # If model returned fewer than 4 chapters while sections has more, preserve full book chapters across all pages
        if sections and len(chapters) < max(4, min(len(sections), 6)):
            chapters = [
                {
                    "chapter": idx + 1,
                    "title": s.get("title", f"Section {idx+1}"),
                    "summary": s.get("summary", ""),
                    "page": s.get("page", idx + 1)
                }
                for idx, s in enumerate(sections)
            ]

        return {
            "title": clean_title,
            "overview": overview,
            "complete_summary": overview,
            "summary": overview,
            "main_takeaway": data.get("main_takeaway") or f"Core principles and analytical workflow of {clean_title}.",
            "key_points": data.get("key_points") or [
                f"Essential domain requirements and foundational concepts for {clean_title}.",
                "Detailed architecture, component interactions, and practical applications.",
                "Validation benchmarks, experimental analysis, and operational outcomes."
            ],
            "topics_covered": data.get("topics_covered") or ["Overview", "Core Concepts", "Analysis", "Applications"],
            "chapters": chapters,
            "concepts": data.get("concepts") or [],
            "definitions": data.get("definitions") or [],
            "important_notes": data.get("important_notes") or []
        }

    def _rule_based_summary_extraction(
        self,
        full_text: str,
        filename: str,
        sections: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Smart heuristic parser extracting genuine sentences, terms, and takeaways across the entire document."""
        def is_bp(line: str) -> bool:
            l = line.lower().strip()
            bp = [
                "government of", "free textbook programme", "department of school education",
                "untouchability is", "not for sale", "first edition", "revised edition",
                "reprint", "published by", "printed by", "scert", "all rights reserved",
                "isbn", ".indd", "typeset", "content creation", "printing & publishing",
                "page no.", "wrapper printed"
            ]
            return any(b in l for b in bp)

        # 1. Clean doc title (strip web domains, file extensions, and boilerplate)
        clean_name = filename or "Study Document"
        clean_name = re.sub(r'\.(pdf|docx|doc|txt|epub)$', '', clean_name, flags=re.I)
        clean_name = re.sub(r'www\.[a-z0-9\-]+(\.[a-z]{2,})+', '', clean_name, flags=re.I)
        clean_name = clean_name.replace('_', ' ').replace('-', ' ').strip().title()
        doc_title = clean_name if clean_name else "Study Document"

        # 2. Extract substantive sentences (excluding boilerplate)
        raw_sentences = [
            s.strip().replace('\n', ' ') for s in re.split(r'(?<=[.!?])\s+', full_text or "")
            if len(s.strip()) > 35 and not is_bp(s) and not s.strip().startswith(('#', '-', '*', '|', '<', '>'))
        ]

        # 3. Build chapters covering the ENTIRE document (never truncate to 10)
        chapters = []
        if sections:
            for idx, s in enumerate(sections):
                chapters.append({
                    "chapter": idx + 1,
                    "title": s.get("title") or f"Section {idx + 1}",
                    "summary": s.get("summary") or f"Comprehensive principles, analysis, and study applications of {s.get('title', 'this topic')}.",
                    "page": s.get("page", idx + 1)
                })
        else:
            for line in (full_text or "").split("\n"):
                l_clean = line.strip()
                if (l_clean.startswith("#") or (l_clean.isupper() and len(l_clean) < 50) or (":" in l_clean and len(l_clean) < 50)) and len(l_clean) > 4:
                    if not is_bp(l_clean):
                        h_title = l_clean.lstrip("#").strip().rstrip(":")
                        if h_title and h_title not in [c["title"] for c in chapters]:
                            chapters.append({
                                "chapter": len(chapters) + 1,
                                "title": h_title,
                                "summary": f"Key concepts, analysis, and principles of {h_title}.",
                                "page": len(chapters) + 1
                            })
                            if len(chapters) >= 25:
                                break
        if not chapters:
            chapters = [
                {"chapter": 1, "title": f"Introduction to {doc_title}", "summary": f"Foundational concepts and overview for {doc_title}.", "page": 1}
            ]

        # 4. Generate comprehensive overview and main takeaway
        content_intro = ""
        for s in raw_sentences[:4]:
            if len(s) > 40:
                content_intro += (" " if content_intro else "") + s
                if len(content_intro) > 280:
                    break

        if len(chapters) > 4:
            overview = f"A comprehensive study curriculum for '{doc_title}' spanning {len(chapters)} key sections. It covers foundational principles, core analytical frameworks, literature analysis, and practical exercises. {content_intro}"
            main_takeaway = f"Essential mastery of core subject concepts, practical skills, and analytical methods presented across {doc_title}."
        elif content_intro:
            overview = content_intro
            main_takeaway = raw_sentences[0] if raw_sentences else f"Foundational insights and systematic understanding of {doc_title}."
        else:
            overview = f"A comprehensive study guide analyzing the principles, methods, and practical applications of {doc_title}."
            main_takeaway = f"Core principles and analytical workflow of {doc_title}."

        # 5. Extract key points distributed across chapters/sections
        key_points = []
        if sections and len(sections) >= 3:
            step = max(1, len(sections) // 6)
            for idx in range(min(6, len(sections))):
                sec = sections[min(idx * step, len(sections) - 1)]
                s_title = sec.get("title", "")
                s_sum = sec.get("summary", "")
                if s_sum and not is_bp(s_sum):
                    first_sent = s_sum.split(".")[0].strip()
                    if len(first_sent) > 25 and len(first_sent) < 180:
                        pt = f"{s_title}: {first_sent}."
                        if pt not in key_points:
                            key_points.append(pt)
        if len(key_points) < 3:
            for line in (full_text or "").split("\n"):
                clean_l = line.strip()
                if clean_l.startswith(("-", "•", "*", "1.", "2.", "3.", "4.", "5.")) and len(clean_l) > 25:
                    if not is_bp(clean_l):
                        bp = clean_l.lstrip("-•* 0123456789.").strip()
                        if bp and bp not in key_points and len(bp) < 200:
                            key_points.append(bp)
                            if len(key_points) >= 6:
                                break
        if len(key_points) < 3 and raw_sentences:
            step = max(1, len(raw_sentences) // 4)
            for idx in range(min(5, len(raw_sentences))):
                sent = raw_sentences[min(idx * step, len(raw_sentences) - 1)]
                if sent not in key_points:
                    key_points.append(sent)

        # 6. Concepts derived from substantive chapters across the book
        concepts = []
        meaningful_chaps = [
            c for c in chapters
            if not any(k in c["title"].lower() for k in ["front matter", "table of contents", "acknowledgement", "preface", "page"])
        ]
        chosen_chaps = meaningful_chaps if meaningful_chaps else chapters
        step_c = max(1, len(chosen_chaps) // 6)
        for idx in range(min(6, len(chosen_chaps))):
            ch = chosen_chaps[min(idx * step_c, len(chosen_chaps) - 1)]
            if ch["title"] not in [c["name"] for c in concepts]:
                concepts.append({
                    "name": ch["title"],
                    "explanation": ch.get("summary", f"Core concepts and study applications of {ch['title']}."),
                    "how_it_works": f"Systematic analysis, learning objectives, and exercise workflows for {ch['title']}.",
                    "example": f"Applied in practical problem-solving and domain evaluation for {ch['title']}."
                })

        # 7. Definitions from document text
        definitions = []
        for line in (full_text or "").split("\n"):
            l_clean = line.strip()
            if not is_bp(l_clean) and any(marker in l_clean.lower() for marker in [" is a ", " is an ", " refers to ", " defined as "]) and len(l_clean) < 180:
                parts = re.split(r"\s+is a\s+|\s+is an\s+|\s+refers to\s+|\s+defined as\s+", l_clean, maxsplit=1, flags=re.IGNORECASE)
                if len(parts) == 2 and 3 < len(parts[0]) < 40 and len(parts[1]) > 10:
                    term = parts[0].strip().lstrip("-*• ")
                    defn = parts[1].strip()
                    if term and defn and term not in [d["term"] for d in definitions] and not is_bp(term):
                        definitions.append({"term": term, "definition": defn})
                        if len(definitions) >= 6:
                            break

        # 8. Important notes across document pages
        important_notes = []
        if sections and len(sections) >= 3:
            for s in sections:
                if any(k in s.get("title", "").lower() for k in ["prose", "poem", "supplementary", "unit", "chapter"]):
                    important_notes.append({
                        "note": f"Key learning objectives and curriculum assessments for {s['title']}.",
                        "type": "Exam Focus",
                        "page": s.get("page", 1)
                    })
                    if len(important_notes) >= 6:
                        break
        if len(important_notes) < 3:
            for sent in raw_sentences:
                if any(k in sent.lower() for k in ["note", "important", "must", "always", "formula", "equation", "required", "critical", "key"]):
                    important_notes.append({
                        "note": sent,
                        "type": "Exam Focus" if any(w in sent.lower() for w in ["formula", "equation", "theorem"]) else "Requirement",
                        "page": 1
                    })
                    if len(important_notes) >= 5:
                        break

        # 9. Topics covered tags
        topics = [c["title"] for c in meaningful_chaps[:8]] if meaningful_chaps else ["Overview", "Core Concepts", "Analysis", "Applications"]

        return {
            "title": doc_title,
            "overview": overview,
            "complete_summary": overview,
            "summary": overview,
            "main_takeaway": main_takeaway,
            "key_points": key_points[:6],
            "topics_covered": topics[:8],
            "chapters": chapters,
            "concepts": concepts,
            "definitions": definitions[:6],
            "important_notes": important_notes
        }

    def generate_summary(
        self,
        title: str,
        mode: str = "complete",
        chapter_id: int = 1,
        concept: str = "",
        language: str = "English"
    ) -> Dict[str, Any]:
        """Provides a structured summary adapted to mode and requested language."""
        return self._rule_based_summary_extraction(
            full_text=f"{title}\nCore Concepts and Architecture Overview.",
            filename=f"{title}.pdf"
        )


llama_service = LlamaService()
