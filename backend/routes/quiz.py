from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from database.postgres import get_db
from models.models import QuizResult, LearningProgress, Textbook, User

router = APIRouter(prefix="/api/quiz", tags=["Quiz and Knowledge Check"])

class QuizSubmission(BaseModel):
    user_id: int
    textbook_id: Optional[int] = None
    topic: str
    answers: List[Dict[str, Any]] # [{'question_id': 1, 'selected_option': 2, 'is_correct': True}]

@router.get("/{textbook_id}")
def get_quiz_questions(textbook_id: int, db: Session = Depends(get_db)):
    book = db.query(Textbook).filter(Textbook.id == textbook_id).first()
    book_title = book.title if book else "Computer Networks & Systems"

    # Dynamic curated question bank based on textbook subject
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
            "explanation": "The Transport Layer (Layer 4), utilizing protocols like TCP, is responsible for end-to-end communication, segmentation, flow control, and error recovery between processes."
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
            "explanation": "The receiver advertises its available buffer space (receive window) in ACK packets so the sender does not overflow the receiver's memory buffer."
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
            "explanation": "OSPF is a link-state routing protocol that utilizes Dijkstra's Shortest Path First (SPF) algorithm to calculate loop-free lowest cost paths across network topologies."
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
            "explanation": "CIDR replaced fixed Class A, B, and C address allocations with flexible prefix lengths, preventing rapid IP address exhaustion and aggregating routes to shrink global routing tables."
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
            "explanation": "Flow control ensures a fast sender doesn't overrun a slow receiver. Congestion control prevents all combined senders from saturating the routers and links of the intermediate network."
        }
    ]

    return {
        "textbook_id": textbook_id,
        "textbook_title": book_title,
        "topic": "Core Networking & Transport Layer Protocols",
        "total_questions": len(questions),
        "questions": questions
    }

@router.post("/submit")
def submit_quiz(req: QuizSubmission, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    correct_count = sum(1 for a in req.answers if a.get("is_correct", False))
    total = len(req.answers)
    percentage = (correct_count / total * 100) if total > 0 else 0.0

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
    # Recalculate average
    past_scores = [q.percentage for q in user.quiz_results] + [percentage]
    progress.quiz_scores_avg = round(sum(past_scores) / len(past_scores), 1)
    progress.last_active = datetime.utcnow()

    # Dynamic badge unlock
    if percentage >= 90 and "Quiz Ace" not in (progress.badges or []):
        badges = list(progress.badges or [])
        badges.append("Quiz Ace")
        progress.badges = badges

    db.commit()

    return {
        "success": True,
        "score": correct_count,
        "total": total,
        "percentage": round(percentage, 1),
        "passed": percentage >= 70,
        "feedback": "Outstanding mastery! You have demonstrated a deep understanding of core protocol mechanics." if percentage >= 80 else "Good effort! Review the chapter summary to strengthen your grasp on sliding windows and routing.",
        "new_badge_unlocked": "Quiz Ace" if percentage >= 90 else None
    }
