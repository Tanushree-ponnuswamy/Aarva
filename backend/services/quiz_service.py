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


def _call_ollama_for_questions(context: str, num_questions: int, topic_hint: str) -> Optional[List[Dict]]:
    """
    Prompts Ollama (Mistral/Llama) to generate MCQ questions from retrieved context.
    Returns parsed list of question dicts, or None if Ollama is unavailable.
    """
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
        "- Vary difficulty: include easy, medium, and hard questions\n"
        f"- Topic hint: {topic_hint}\n\n"
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

    for model in ["mistral:latest", "llama3:latest", "llama3.2:1b"]:
        try:
            res = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.6, "top_p": 0.9}
                },
                timeout=30.0
            )
            if res.status_code == 200:
                raw = res.json().get("response", "").strip()
                # Extract JSON array from response
                match = re.search(r'\[.*\]', raw, re.DOTALL)
                if match:
                    questions = json.loads(match.group())
                    if isinstance(questions, list) and len(questions) > 0:
                        return questions
        except Exception as e:
            print(f"[QUIZ_SERVICE] Ollama model {model} failed: {e}")
            continue

    return None


def generate_quiz_questions(
    textbook_id: Optional[int],
    topic: Optional[str] = None,
    num_questions: int = 5,
    difficulty: str = "mixed"
) -> List[Dict[str, Any]]:
    """
    Main quiz generation pipeline:
    1. Hybrid retrieval for relevant textbook chunks
    2. LLM-powered MCQ generation from retrieved context
    3. Fallback to curated question bank if LLM unavailable
    """
    from services.hybrid_retrieval import hybrid_retrieval_engine

    query = topic or "key concepts definitions and mechanisms"

    # Step 1: Retrieve rich context from hybrid engine
    try:
        retrieved_chunks = hybrid_retrieval_engine.retrieve(
            query=query,
            textbook_id=textbook_id,
            top_k=5
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

    combined_context = "\n\n".join(context_parts[:5])

    # Step 3: Attempt LLM generation if we have context
    if combined_context.strip():
        llm_questions = _call_ollama_for_questions(
            context=combined_context,
            num_questions=num_questions,
            topic_hint=topic or "general subject matter"
        )
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

    # Step 4: Contextual fallback — select from curated bank
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
