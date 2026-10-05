from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from database.postgres import get_db
from models.models import QuizResult, LearningProgress, Textbook, User

router = APIRouter(prefix="/api/quiz", tags=["Quiz and Knowledge Check"])


# ─── Request / Response Models ────────────────────────────────────────────────

class QuizGenerateRequest(BaseModel):
    textbook_id: Optional[int] = None
    topic: Optional[str] = None
    num_questions: int = 5
    difficulty: str = "mixed"  # easy | medium | hard | mixed


class QuizSubmission(BaseModel):
    user_id: int
    textbook_id: Optional[int] = None
    topic: str
    answers: List[Dict[str, Any]]  # [{'question_id': 1, 'selected_option': 2, 'is_correct': True}]


# ─── AI-Powered Quiz Generation (RAG + LLM) ──────────────────────────────────

@router.post("/generate")
def generate_ai_quiz(req: QuizGenerateRequest):
    """
    Generate quiz questions using Hybrid Retrieval (Dense + BM25) + LLM.
    Falls back to curated question bank if Ollama is not available.
    """
    from services.quiz_service import generate_quiz_questions, get_difficulty_distribution

    questions = generate_quiz_questions(
        textbook_id=req.textbook_id,
        topic=req.topic,
        num_questions=req.num_questions,
        difficulty=req.difficulty
    )

    difficulty_dist = get_difficulty_distribution(questions)
    source = questions[0].get("source", "Curated Question Bank") if questions else "Curated Question Bank"
    is_ai_generated = "AI-Generated" in source

    return {
        "textbook_id": req.textbook_id,
        "topic": req.topic or "Adaptive Knowledge Assessment",
        "total_questions": len(questions),
        "questions": questions,
        "difficulty_distribution": difficulty_dist,
        "generation_method": "AI-Generated from Textbook RAG (Hybrid Retrieval + Ollama LLM)" if is_ai_generated else "Curated Expert Question Bank",
        "ai_powered": is_ai_generated
    }


# ─── Static Fallback Quiz (Legacy) ──────────────────────────────────────────

@router.get("/{textbook_id}")
def get_quiz_questions(textbook_id: int, db: Session = Depends(get_db)):
    """Legacy endpoint - returns curated static questions for a textbook."""
    book = db.query(Textbook).filter(Textbook.id == textbook_id).first()
    book_title = book.title if book else "Computer Networks & Systems"

    questions = [
        {
            "id": 1,
            "question": "Which layer in the OSI model is responsible for reliable process-to-process data delivery?",
            "options": [
                "Network Layer (Layer 3)",
                "Transport Layer (Layer 4)",
                "Data Link Layer (Layer 2)",
                "Session Layer (Layer 5)"
            ],
            "correct_option": 1,
            "explanation": "The Transport Layer (Layer 4), utilizing protocols like TCP, is responsible for end-to-end communication, segmentation, flow control, and error recovery between processes.",
            "difficulty": "medium",
            "topic": "OSI Model"
        },
        {
            "id": 2,
            "question": "In the Sliding Window Protocol, what is the purpose of the 'advertised window'?",
            "options": [
                "To tell routers how fast to forward packets",
                "To signal the maximum bandwidth of the physical cable",
                "To inform the sender of available buffer space at the receiver",
                "To encrypt header authentication data"
            ],
            "correct_option": 2,
            "explanation": "The receiver advertises its available buffer space (receive window) in ACK packets so the sender does not overflow the receiver's memory buffer.",
            "difficulty": "hard",
            "topic": "Flow Control"
        },
        {
            "id": 3,
            "question": "Which algorithm is utilized by OSPF (Open Shortest Path First) for routing path computation?",
            "options": [
                "Bellman-Ford Algorithm",
                "Dijkstra's Link-State Algorithm",
                "Floyd-Warshall All-Pairs Algorithm",
                "Prim's Minimum Spanning Tree"
            ],
            "correct_option": 1,
            "explanation": "OSPF is a link-state routing protocol that utilizes Dijkstra's Shortest Path First (SPF) algorithm to calculate loop-free lowest cost paths across network topologies.",
            "difficulty": "medium",
            "topic": "Routing Protocols"
        },
        {
            "id": 4,
            "question": "What primary problem does CIDR (Classless Inter-Domain Routing) solve?",
            "options": [
                "Slow DNS hostname lookup times",
                "Rapid depletion of IPv4 address space and routing table bloat",
                "Packet fragmentation on high MTU links",
                "Insecure transmission of unencrypted plaintext passwords"
            ],
            "correct_option": 1,
            "explanation": "CIDR replaced fixed Class A, B, and C address allocations with flexible prefix lengths, preventing rapid IP address exhaustion and aggregating routes to shrink global routing tables.",
            "difficulty": "easy",
            "topic": "IP Addressing"
        },
        {
            "id": 5,
            "question": "What is the key difference between TCP Congestion Control and Flow Control?",
            "options": [
                "Flow control protects the receiver from buffer overflow; congestion control protects intermediate network routers",
                "Flow control operates on UDP while congestion control operates on TCP",
                "Congestion control is purely hardware-based; flow control is application software",
                "There is no difference; they refer to the exact same mechanism"
            ],
            "correct_option": 0,
            "explanation": "Flow control ensures a fast sender doesn't overrun a slow receiver. Congestion control prevents all combined senders from saturating the routers and links of the intermediate network.",
            "difficulty": "hard",
            "topic": "TCP Mechanisms"
        }
    ]

    return {
        "textbook_id": textbook_id,
        "textbook_title": book_title,
        "topic": "Core Networking & Transport Layer Protocols",
        "total_questions": len(questions),
        "questions": questions,
        "ai_powered": False
    }


# ─── Quiz Submission & Scoring ────────────────────────────────────────────────

@router.post("/submit")
def submit_quiz(req: QuizSubmission, db: Session = Depends(get_db)):
    """Submit completed quiz answers, record result, and update gamification."""
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    correct_count = sum(1 for a in req.answers if a.get("is_correct", False))
    total = len(req.answers)
    percentage = (correct_count / total * 100) if total > 0 else 0.0

    # XP calculation with bonus for high scores
    base_xp = 50
    bonus_xp = 30 if percentage >= 90 else (15 if percentage >= 75 else 0)
    total_xp_earned = base_xp + bonus_xp

    # Record quiz result
    quiz_res = QuizResult(
        user_id=req.user_id,
        textbook_id=req.textbook_id,
        topic=req.topic,
        score=correct_count,
        total_questions=total,
        percentage=round(percentage, 1),
        details=req.answers
    )
    db.add(quiz_res)

    # Update student learning progress
    progress = user.progress
    if not progress:
        progress = LearningProgress(user_id=user.id)
        db.add(progress)

    progress.completed_topics = (progress.completed_topics or 0) + 1
    past_scores = [q.percentage for q in user.quiz_results] + [percentage]
    progress.quiz_scores_avg = round(sum(past_scores) / len(past_scores), 1)
    progress.last_active = datetime.utcnow()

    # XP Award
    current_xp = progress.xp or 0
    progress.xp = current_xp + total_xp_earned

    # Dynamic badge unlock
    new_badges = []
    existing_badges = list(progress.badges or [])

    if percentage >= 90 and "Quiz Ace" not in existing_badges:
        existing_badges.append("Quiz Ace")
        new_badges.append("Quiz Ace")

    if percentage == 100 and "Perfect Score" not in existing_badges:
        existing_badges.append("Perfect Score")
        new_badges.append("Perfect Score")

    if progress.completed_topics >= 5 and "Knowledge Seeker" not in existing_badges:
        existing_badges.append("Knowledge Seeker")
        new_badges.append("Knowledge Seeker")

    progress.badges = existing_badges
    db.commit()

    # Build performance feedback
    if percentage >= 90:
        feedback = "🏆 Outstanding mastery! You have demonstrated a deep understanding of the core concepts."
    elif percentage >= 75:
        feedback = "✅ Great work! You have a solid grasp. Review the explanation for any missed questions."
    elif percentage >= 60:
        feedback = "📚 Good effort! Focus on reviewing the explanations to strengthen your understanding."
    else:
        feedback = "💪 Keep going! Re-read the chapter summary and try the quiz again — practice makes perfect."

    return {
        "success": True,
        "score": correct_count,
        "total": total,
        "percentage": round(percentage, 1),
        "passed": percentage >= 60,
        "xp_earned": total_xp_earned,
        "feedback": feedback,
        "new_badges_unlocked": new_badges,
        "new_badge_unlocked": new_badges[0] if new_badges else None
    }


# ─── Leaderboard (Mock for now) ───────────────────────────────────────────────

@router.get("/leaderboard/top")
def get_quiz_leaderboard(db: Session = Depends(get_db)):
    """Get top quiz performers for gamification leaderboard."""
    try:
        results = db.query(User, LearningProgress).join(
            LearningProgress, User.id == LearningProgress.user_id
        ).order_by(LearningProgress.xp.desc()).limit(10).all()

        leaderboard = []
        for rank, (user, prog) in enumerate(results, 1):
            leaderboard.append({
                "rank": rank,
                "name": user.name,
                "xp": prog.xp or 0,
                "level": prog.level or 1,
                "avg_score": prog.quiz_scores_avg or 0,
                "badge_count": len(prog.badges or [])
            })

        return {"leaderboard": leaderboard}
    except Exception:
        # Fallback mock leaderboard
        return {
            "leaderboard": [
                {"rank": 1, "name": "Aarav Sharma", "xp": 840, "level": 5, "avg_score": 94.2, "badge_count": 6},
                {"rank": 2, "name": "Priya Patel", "xp": 720, "level": 4, "avg_score": 88.5, "badge_count": 4},
                {"rank": 3, "name": "Rohan Iyer", "xp": 610, "level": 4, "avg_score": 85.0, "badge_count": 3},
                {"rank": 4, "name": "Maya Sen", "xp": 480, "level": 3, "avg_score": 79.3, "badge_count": 2},
                {"rank": 5, "name": "You", "xp": 240, "level": 2, "avg_score": 72.0, "badge_count": 1},
            ]
        }
