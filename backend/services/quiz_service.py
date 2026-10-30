"""
Quiz Generation Service for AARVA.

Uses Hybrid Retrieval (Dense + BM25 RRF) to extract relevant context
from the knowledge base, then prompts a local LLM (Ollama) to generate
high-quality MCQ questions with explanations and difficulty tagging.

Falls back to contextual template questions if Ollama is unavailable.
"""
import json
import re
import random
import requests
from typing import List, Dict, Any, Optional
from config import settings


FALLBACK_QUESTIONS_BANK: List[Dict[str, Any]] = [
    {
        "id": 1,
        "question": "Which OSI model layer is responsible for reliable end-to-end process delivery using TCP?",
        "options": ["Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Data Link Layer (Layer 2)", "Session Layer (Layer 5)"],
        "correct_option": 1,
        "explanation": "The Transport Layer (Layer 4) uses TCP to provide reliable, ordered, and error-checked delivery of data streams between applications.",
        "difficulty": "medium",
        "topic": "OSI Model"
    },
    {
        "id": 2,
        "question": "What does the 'advertised window' in the Sliding Window Protocol inform the sender about?",
        "options": [
            "The maximum routing table size",
            "Available buffer space at the receiver",
            "The bandwidth of the physical medium",
            "The maximum segment size (MSS)"
        ],
        "correct_option": 1,
        "explanation": "The receiver advertises its available buffer space via ACK packets so the sender throttles transmission to avoid buffer overflow.",
        "difficulty": "hard",
        "topic": "Flow Control"
    },
    {
        "id": 3,
        "question": "Which shortest-path algorithm does OSPF use to compute loop-free routes?",
        "options": ["Bellman-Ford", "Dijkstra's SPF", "Floyd-Warshall", "Prim's MST"],
        "correct_option": 1,
        "explanation": "OSPF (Open Shortest Path First) is a link-state protocol that runs Dijkstra's Shortest Path First algorithm on a full topology map.",
        "difficulty": "medium",
        "topic": "Routing Protocols"
    },
    {
        "id": 4,
        "question": "What primary problem does CIDR (Classless Inter-Domain Routing) address?",
        "options": [
            "DNS resolution latency",
            "Rapid IPv4 exhaustion and routing table bloat",
            "Packet fragmentation on high-MTU links",
            "Plaintext password exposure over HTTP"
        ],
        "correct_option": 1,
        "explanation": "CIDR replaces fixed Class A/B/C address blocks with flexible prefix notation, slowing IPv4 exhaustion and enabling route aggregation.",
        "difficulty": "easy",
        "topic": "IP Addressing"
    },
    {
        "id": 5,
        "question": "What is the key difference between TCP Flow Control and TCP Congestion Control?",
        "options": [
            "Flow control protects the receiver; congestion control protects the network",
            "Flow control uses UDP; congestion control uses TCP",
            "They are identical mechanisms with different names",
            "Congestion control is hardware-only; flow control is software"
        ],
        "correct_option": 0,
        "explanation": "Flow control prevents a fast sender from overwhelming a slow receiver's buffer. Congestion control prevents too many senders from saturating intermediate network routers.",
        "difficulty": "hard",
        "topic": "TCP Mechanisms"
    },
    {
        "id": 6,
        "question": "In TCP's AIMD (Additive Increase Multiplicative Decrease), what triggers the multiplicative decrease?",
        "options": [
            "Receipt of a duplicate ACK",
            "A retransmission timeout (RTO) expiry or 3 duplicate ACKs",
            "A SYN packet being received",
            "The receiver window reaching zero"
        ],
        "correct_option": 1,
        "explanation": "TCP halves its congestion window (cwnd) on detecting loss via triple duplicate ACKs (fast retransmit) or sets cwnd=1 on a full timeout.",
        "difficulty": "hard",
        "topic": "Congestion Control"
    },
    {
        "id": 7,
        "question": "Which data structure does a network switch use to forward frames to the correct port?",
        "options": ["Routing table (IP-to-port)", "MAC address table (CAM table)", "ARP cache", "DNS resolver cache"],
        "correct_option": 1,
        "explanation": "Ethernet switches maintain a Content Addressable Memory (CAM) table mapping MAC addresses to physical ports, learned dynamically via frame inspection.",
        "difficulty": "easy",
        "topic": "Switching & Bridging"
    },
    {
        "id": 8,
        "question": "What is the maximum number of usable host addresses in a /26 subnet?",
        "options": ["30", "62", "64", "126"],
        "correct_option": 1,
        "explanation": "A /26 subnet has 2^6 = 64 addresses. Subtracting the network address and broadcast address gives 62 usable host addresses.",
        "difficulty": "medium",
        "topic": "Subnetting"
    },
    {
        "id": 9,
        "question": "Which protocol does a router use to dynamically learn the MAC address of a known IP address on a local network?",
        "options": ["RARP", "DHCP", "ARP", "ICMP"],
        "correct_option": 2,
        "explanation": "ARP (Address Resolution Protocol) broadcasts a request asking 'who has IP X?' and the device with that IP responds with its MAC address.",
        "difficulty": "easy",
        "topic": "ARP & IP"
    },
    {
        "id": 10,
        "question": "In TCP's three-way handshake, what does the client send in the very first step?",
        "options": ["SYN-ACK", "FIN", "SYN", "RST"],
        "correct_option": 2,
        "explanation": "The client initiates the connection by sending a SYN (synchronize) segment with an initial sequence number to the server.",
        "difficulty": "easy",
        "topic": "TCP Connection Management"
    }
]


def _call_ollama_for_questions(context: str, num_questions: int, topic_hint: str, language: str = "English", difficulty: str = "mixed") -> Optional[List[Dict]]:
    """
    Prompts Ollama (Mistral/Llama/Qwen) to generate MCQ questions from retrieved context in the specified language.
    Returns parsed list of question dicts, or None if Ollama is unavailable.
    """
    lang_mandate = ""
    if language and language.strip().lower() not in ("english", "en"):
        lang_mandate = f"\n- CRITICAL LANGUAGE MANDATE: All question text, options, and explanations MUST be written entirely in {language}."

    prompt = (
        "You are an expert academic quiz generator for AARVA, an AI learning platform.\n\n"
        f"Based on the following textbook content, generate exactly {num_questions} high-quality multiple-choice questions (MCQs).\n\n"
        "TEXTBOOK CONTENT:\n"
        f"{context}\n\n"
        "REQUIREMENTS:\n"
        "- Each question must be directly based on the provided content\n"
        "- Each question must have exactly 4 options\n"
        "- Mark the correct answer as a zero-indexed integer (0=first, 1=second, 2=third, 3=fourth)\n"
        "- Include a detailed educational explanation (2-3 sentences)\n"
        f"- Difficulty: {'a balanced mix of easy, medium and hard' if difficulty == 'mixed' else difficulty}\n"
        "- Wrong options must be plausible but clearly incorrect; never use 'all of the above' or 'none of the above'\n"
        f"- Topic hint: {topic_hint}"
        f"{lang_mandate}\n\n"
        "OUTPUT FORMAT (strict JSON array only, no extra text):\n"
        '[\n'
        '  {\n'
        '    "question": "Question text here?",\n'
        '    "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        '    "correct_option": 0,\n'
        '    "explanation": "Why the correct answer is right...",\n'
        '    "difficulty": "easy|medium|hard",\n'
        '    "topic": "Topic name"\n'
        '  }\n'
        ']\n\n'
        f"Generate exactly {num_questions} questions as a valid JSON array:"
    )

    # Call Ollama with available LLM (Qwen3 8B / Qwen2.5 / Llama3)
    try:
        from services.llama_service import llama_service
        model_to_use = llama_service._get_best_model() if hasattr(llama_service, "_get_best_model") else settings.LLM_MODEL
        res = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": model_to_use,
                "prompt": prompt,
                "stream": False,
                "think": False,
                "options": {"temperature": 0.5, "top_p": 0.9, "num_predict": 220 * num_questions + 300}
            },
            timeout=150.0
        )
        if res.status_code == 200:
            raw = res.json().get("response", "").strip()
            # Extract JSON array from response
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                questions = json.loads(match.group())
                valid = []
                for q in questions if isinstance(questions, list) else []:
                    try:
                        opts = [str(o) for o in q.get("options", [])]
                        idx = int(q.get("correct_option", -1))
                        if str(q.get("question", "")).strip() and len(opts) == 4 and 0 <= idx <= 3:
                            valid.append(q)
                    except (AttributeError, TypeError, ValueError):
                        continue
                if valid:
                    return valid
    except Exception as e:
        print(f"[QUIZ_SERVICE] Ollama generation failed: {e}")

    return None


def _extractive_questions(chunks: List[Dict[str, Any]], n: int) -> List[Dict[str, Any]]:
    """Multiple-choice 'complete the sentence' questions built straight from the document text.

    Used when the LLM is unavailable so a quiz still comes from the PDF (never from a generic bank).
    """
    import random
    from services.deep_summary import _sentences, _STOP

    items = []  # (sentence, page)
    for c in chunks:
        page = (c.get("metadata") or {}).get("page") or (c.get("metadata") or {}).get("page_number") or 1
        for s in _sentences(c.get("content", "")):
            if 40 <= len(s) <= 220 and s not in [i[0] for i in items]:
                items.append((s, page))
    if not items:
        return []
    tok = lambda s: re.findall(r"[A-Za-z0-9][A-Za-z0-9'-]{3,}", s)
    freq: Dict[str, int] = {}
    for s, _ in items:
        for w in set(tok(s)):
            freq[w] = freq.get(w, 0) + 1
    pool = [w for w, k in freq.items() if w.lower() not in _STOP and len(w) >= 4]
    rng = random.Random(len(items) * 7919 + sum(len(s) for s, _ in items))
    rng.shuffle(items)
    out: List[Dict[str, Any]] = []
    for s, page in items:
        cands = [w for w in tok(s) if w in pool and not s.startswith(w)]
        if not cands:
            continue
        answer = min(cands, key=lambda w: (freq[w], -len(w)))  # a distinctive term of this sentence
        kind_num = answer[0].isdigit()
        same = [w for w in pool if w != answer and w not in s and (w[0].isdigit() == kind_num) and (w[0].isupper() == answer[0].isupper())]
        if len(same) < 3:
            same = [w for w in pool if w != answer and w not in s]
        if len(same) < 3:
            continue
        options = rng.sample(same, 3) + [answer]
        rng.shuffle(options)
        out.append({
            "id": len(out) + 1,
            "question": "Which word correctly completes this statement from the lesson?\n\n\u201c" + s.replace(answer, "_____", 1) + "\u201d",
            "options": options,
            "correct_option": options.index(answer),
            "explanation": f"The lesson says: \u201c{s}\u201d (Page {page}).",
            "difficulty": "easy" if kind_num or answer[0].isupper() else "medium",
            "topic": "From your document",
            "source": "Generated from your document",
        })
        if len(out) >= n:
            break
    return out


def generate_quiz_questions(
    textbook_id: Optional[int],
    topic: Optional[str] = None,
    num_questions: int = 5,
    difficulty: str = "mixed",
    language: str = "English",
    page_range: Optional[tuple] = None
) -> List[Dict[str, Any]]:
    """
    Main quiz generation pipeline:
    1. Hybrid retrieval for relevant textbook chunks (if textbook_id given)
    2. LLM-powered MCQ generation in user's target language
    3. Fallback to curated question bank if LLM unavailable
    """
    from services.hybrid_retrieval import hybrid_retrieval_engine

    query = topic or "key concepts definitions and mechanisms"
    retrieved_chunks = []

    # Step 1: a lesson's questions come from that lesson's own pages; otherwise retrieve by topic
    if textbook_id and page_range:
        try:
            lo, hi = page_range
            corpus = hybrid_retrieval_engine._get_corpus_chunks(textbook_id)
            inside = sorted((c for c in corpus if lo <= int((c.get('metadata') or {}).get('page') or (c.get('metadata') or {}).get('page_number') or 0) <= hi),
                            key=lambda c: int((c.get('metadata') or {}).get('page') or 0))
            step = max(1, len(inside) // 12)
            retrieved_chunks = inside[::step][:12]
        except Exception as e:
            print(f"[QUIZ_SERVICE] Lesson chunk load failed: {e}")
    elif textbook_id:
        try:
            retrieved_chunks = hybrid_retrieval_engine.retrieve(
                query=query,
                textbook_id=textbook_id,
                top_k=8
            )
        except Exception as e:
            print(f"[QUIZ_SERVICE] Retrieval failed: {e}")
            retrieved_chunks = []

    # Step 2: Build context block from retrieved chunks
    context_parts = []
    for chunk in retrieved_chunks:
        meta = chunk.get("metadata", {})
        title = meta.get("title", "Document")
        page = meta.get("page", 1)
        content = chunk.get("content", "")
        if content:
            context_parts.append(f"[{title} | Page {page}]\n{content}")

    combined_context = "\n\n".join(context_parts[:8])[:9000]
    if not combined_context.strip():
        combined_context = f"Educational subject matter and core concepts regarding {topic or 'academic concepts and problem solving'}."

    # Step 3: Attempt LLM generation
    llm_questions = None
    try:
        from services.llama_service import llama_service
        lang_code = llama_service._normalize_lang(language)
    except Exception:
        llama_service, lang_code = None, "en"
    for _attempt in range(2):
        candidate = _call_ollama_for_questions(
            context=combined_context,
            num_questions=num_questions,
            topic_hint=topic or "general subject matter",
            language=language,
            difficulty=difficulty
        )
        if not candidate:
            break
        sample = " ".join(
            str(q.get("question", "")) + " " + " ".join(str(o) for o in q.get("options", [])) + " " + str(q.get("explanation", ""))
            for q in candidate if isinstance(q, dict)
        )
        if llama_service is None or llama_service._is_in_language(sample, lang_code):
            llm_questions = candidate
            break
        print(f"[QUIZ_SERVICE] Attempt {_attempt + 1} was not written in {language}")
    if llm_questions:
        # Normalize and enrich LLM output
        normalized = []
        for idx, q in enumerate(llm_questions[:num_questions]):
            normalized.append({
                "id": idx + 1,
                "question": q.get("question", f"Question {idx + 1}"),
                "options": q.get("options", ["A", "B", "C", "D"])[:4],
                "correct_option": int(q.get("correct_option", 0)),
                "explanation": q.get("explanation", "See textbook for details."),
                "difficulty": q.get("difficulty", "medium"),
                "topic": q.get("topic", topic or "General"),
                "source": "AI-Generated from Textbook RAG"
            })
        print(f"[QUIZ_SERVICE] Generated {len(normalized)} AI questions via Ollama")
        return normalized

    # Step 4: no LLM. With a document, build questions from its own text; the generic bank only serves requests with no document.
    if retrieved_chunks:
        own = _extractive_questions(retrieved_chunks, num_questions)
        if own:
            print(f"[QUIZ_SERVICE] LLM unavailable: built {len(own)} questions from the document text")
            return own
    print("[QUIZ_SERVICE] Ollama unavailable — using curated question bank")

    pool = FALLBACK_QUESTIONS_BANK.copy()
    if difficulty != "mixed":
        filtered = [q for q in pool if q.get("difficulty") == difficulty]
        pool = filtered if len(filtered) >= num_questions else pool

    selected = random.sample(pool, min(num_questions, len(pool)))

    # Re-index IDs and tag source
    for idx in range(len(selected)):
        q = dict(selected[idx])
        q["id"] = idx + 1
        q["source"] = "Curated Question Bank"
        selected[idx] = q

    return selected


def get_difficulty_distribution(questions: List[Dict]) -> Dict[str, int]:
    """Count questions by difficulty level."""
    dist: Dict[str, int] = {"easy": 0, "medium": 0, "hard": 0}
    for q in questions:
        d = q.get("difficulty", "medium")
        dist[d] = dist.get(d, 0) + 1
    return dist
