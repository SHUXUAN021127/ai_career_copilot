import json

from backend.config import CAREER_PROFILE_DIR


def load_career_profile(career_name: str):

    file_path = (
        CAREER_PROFILE_DIR
        / f"{career_name}.json"
    )

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as f:

        return json.load(f)