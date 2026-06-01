def match_skills(
    resume_skills,
    jd_skills
):

    matched = []

    missing = []

    for skill in jd_skills:

        if skill.lower() in [
            s.lower()
            for s in resume_skills
        ]:

            matched.append(skill)

        else:
            missing.append(skill)

    score = int(
        len(matched)
        / len(jd_skills)
        * 100
    )

    return {
        "score": score,
        "matched": matched,
        "missing": missing
    }