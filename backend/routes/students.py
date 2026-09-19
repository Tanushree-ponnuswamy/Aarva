from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database.postgres import get_db
from models.models import User, StudentProfile, StudentInterests, LearningPreferences, LearningProgress, Textbook, QuizResult
from services.adaptive_service import adaptive_service

router = APIRouter(prefix="/api/student", tags=["Student Learning Space"])

class PreferencesUpdate(BaseModel):
    preferred_language: Optional[str] = "English"
    learning_style: Optional[List[str]] = []
    voice_assistance: Optional[bool] = False
    text_to_speech: Optional[bool] = False
    speech_input: Optional[bool] = False
    larger_text: Optional[bool] = False
    simplified_explanations: Optional[bool] = False

class XpAwardRequest(BaseModel):
    user_id: int
    activity_type: str # "chapter_summary", "concept_review", "quiz_completion"
    details: Optional[str] = "Completed milestone"
    xp_amount: Optional[int] = 50

@router.get("/dashboard/{user_id}")
def get_student_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    textbooks = db.query(Textbook).filter(Textbook.user_id == user_id).all()
    quizzes = db.query(QuizResult).filter(QuizResult.user_id == user_id).order_by(QuizResult.completed_at.desc()).all()
    quiz_scores = [q.percentage for q in quizzes] if quizzes else [85.0]

    # Get adaptive insights
    progress = user.progress
    completed_topics = progress.completed_topics if progress else 12
    interests_list = user.interests.subjects if user.interests else ["Computer Science"]

    adaptive_insights = adaptive_service.analyze_student_progress(
        user_id=user_id,
        quiz_scores=quiz_scores,
        completed_topics=completed_topics,
        interests=interests_list
    )

    xp_val = getattr(progress, "xp", 240) if progress else 240
    level_val = getattr(progress, "level", 3) if progress else 3
    level_title = getattr(progress, "level_title", "Architecture Scholar") if progress else "Architecture Scholar"
    next_level_xp = getattr(progress, "next_level_xp", 500) if progress else 500

    return {
        "student": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "learner_type": user.profile.learner_type if user.profile else "student",
            "institution": user.profile.institution if user.profile else "Academic Institution",
            "department": user.profile.department if user.profile else "General"
        },
        "stats": {
            "textbooks_count": len(textbooks),
            "completed_topics": completed_topics,
            "streak_days": progress.streak_days if progress else 7,
            "avg_quiz_score": adaptive_insights["average_score"],
            "mastery_level": adaptive_insights["mastery_level"],
            "xp": xp_val,
            "level": level_val,
            "level_title": level_title,
            "next_level_xp": next_level_xp
        },
        "gamification": {
            "xp": xp_val,
            "level": level_val,
            "level_title": level_title,
            "next_level_xp": next_level_xp,
            "next_achievement": {
                "title": "Chapter Explorer",
                "requirement": "Complete 2 more chapter summaries",
                "progress_current": 1,
                "progress_target": 3,
                "reward_xp": 100
            },
            "chapter_journey": [
                {
                    "chapter_num": 1,
                    "title": "Foundation & Layered Architecture",
                    "status": "completed",
                    "pages": "1-54",
                    "summary_completed": True,
                    "quiz_completed": True,
                    "xp_earned": 50
                },
                {
                    "chapter_num": 2,
                    "title": "Direct Link Networks & Framing",
                    "status": "completed",
                    "pages": "55-120",
                    "summary_completed": True,
                    "quiz_completed": True,
                    "xp_earned": 50
                },
                {
                    "chapter_num": 3,
                    "title": "Packet Switching & Bridging",
                    "status": "in_progress",
                    "progress_pct": 60,
                    "pages": "121-190",
                    "summary_completed": True,
                    "quiz_completed": False,
                    "xp_earned": 30
                },
                {
                    "chapter_num": 4,
                    "title": "Internetworking (IP) & Routing",
                    "status": "upcoming",
                    "pages": "191-280",
                    "summary_completed": False,
                    "quiz_completed": False,
                    "xp_earned": 0
                }
            ],
            "concept_mastery": [
                {"concept": "Sliding Window Protocol", "status": "mastered", "mastery_pct": 94, "last_reviewed": "Today"},
                {"concept": "OSPF & Dijkstra SPF", "status": "mastered", "mastery_pct": 88, "last_reviewed": "Yesterday"},
                {"concept": "CIDR & Subnet Routing", "status": "learning", "mastery_pct": 72, "last_reviewed": "3 days ago"},
                {"concept": "TCP Congestion Control (AIMD)", "status": "needs_review", "mastery_pct": 58, "last_reviewed": "5 days ago"}
            ]
        },
        "textbooks": [
            {
                "id": tb.id,
                "title": tb.title,
                "author": tb.author,
                "total_pages": tb.total_pages,
                "uploaded_at": tb.uploaded_at.strftime("%Y-%m-%d"),
                "status": tb.status
            }
            for tb in textbooks
        ],
        "recent_quizzes": [
            {
                "id": q.id,
                "topic": q.topic,
                "score": f"{q.score}/{q.total_questions}",
                "percentage": q.percentage,
                "date": q.completed_at.strftime("%b %d, %Y")
            }
            for q in quizzes[:5]
        ],
        "adaptive_recommendations": adaptive_insights["personalized_recommendations"],
        "badges": [
            {"id": "first_summary", "title": "First Summary", "icon": "✨", "description": "Generated first chapter AI synthesis", "unlocked": True},
            {"id": "chapter_explorer", "title": "Chapter Explorer", "icon": "🧭", "description": "Summarized 3 consecutive chapters", "unlocked": True},
            {"id": "concept_master", "title": "Concept Master", "icon": "🧠", "description": "Scored 90%+ in a concept test", "unlocked": True},
            {"id": "consistency", "title": "Consistency Champion", "icon": "🔥", "description": "Maintained a 7-day study streak", "unlocked": True},
            {"id": "book_completed", "title": "Book Completed", "icon": "🏆", "description": "Synthesized and mastered an entire textbook", "unlocked": False}
        ]
    }

@router.post("/award-xp")
def award_xp(req: XpAwardRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    progress = user.progress
    if not progress:
        progress = LearningProgress(user_id=user.id)
        db.add(progress)

    current_xp = getattr(progress, "xp", 240) or 240
    new_xp = current_xp + (req.xp_amount or 50)
    progress.xp = new_xp

    # Level calculation: every 150 XP is a level
    new_level = max(1, new_xp // 120 + 1)
    progress.level = new_level
    if new_level >= 5:
        progress.level_title = "Master Scholar"
    elif new_level >= 3:
        progress.level_title = "Architecture Scholar"
    else:
        progress.level_title = "Curious Reader"

    db.commit()

    return {
        "success": True,
        "awarded_xp": req.xp_amount or 50,
        "total_xp": new_xp,
        "level": new_level,
        "level_title": progress.level_title,
        "message": f"+{req.xp_amount or 50} XP earned for {req.activity_type.replace('_', ' ')}!"
    }

@router.put("/preferences/{user_id}")
def update_preferences(user_id: int, req: PreferencesUpdate, db: Session = Depends(get_db)):
    prefs = db.query(LearningPreferences).filter(LearningPreferences.user_id == user_id).first()
    if not prefs:
        prefs = LearningPreferences(user_id=user_id)
        db.add(prefs)

    prefs.preferred_language = req.preferred_language
    prefs.learning_style = req.learning_style
    prefs.voice_assistance = req.voice_assistance
    prefs.text_to_speech = req.text_to_speech
    prefs.speech_input = req.speech_input
    prefs.larger_text = req.larger_text
    prefs.simplified_explanations = req.simplified_explanations

    db.commit()
    return {"success": True, "message": "Preferences updated successfully."}
