from backend.services.career_profile_service import load_career_profile
from backend.services.skill_matcher import match_skills
from backend.services.learning_path_generator import generate_learning_path
from backend.services.resume_suggestion_generator import (
    generate_resume_suggestions
)

def generate_report(
    resume_info,
    career_name
):

    career_name = career_name.value

    profile = load_career_profile(
        career_name
    )

    match_result = match_skills(
        resume_info["skills"],
        profile["required_skills"]
    )

    learning_path = generate_learning_path(
        profile["career"],
        match_result["missing"]
    )

    resume_suggestions = (
        generate_resume_suggestions(
            resume_info,
            match_result["missing"]
        )
    )

    return {

        "career":
            profile["career"],

        "score":
            match_result["score"],

        "matched":
            match_result["matched"],

        "missing":
            match_result["missing"],

        "learning_path":
            learning_path,

        "resume_suggestions":
            resume_suggestions

    }