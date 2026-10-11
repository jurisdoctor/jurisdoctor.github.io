#!/usr/bin/env python3
"""Convert a Kaplan export (kaplan.json) into the question-bank files the site
reads (src/app/components/Nclex/kaplan/examN.json) plus a manifest listing
which exams exist.

    python3 scripts/build-kaplan.py /Users/tom/Downloads/kaplan.json

The export is {"Exam 4": [question, ...], ...}. Each question carries numbered
options ("1".."4"), a numeric answer (or a list for select-all), a rationale per
option, a topic, a client-need category and a decision-tree step. They become
the site's own question shape: lettered options with a rationale each, topics
as the groups (shown as the "Topics" picker), the decision-tree step as the
Strategy line and the client need as the italic note under it.

Running it again with a file that has more exams (or newer versions of the
same ones) adds or replaces those exams and leaves the others alone.
"""
import json
import re
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src/app/components/Nclex/kaplan"
LETTERS = "ABCDEFGHIJ"


def letter(key):
    return LETTERS[int(key) - 1]


def convert(q):
    answers = q["answer"] if isinstance(q["answer"], list) else [q["answer"]]
    keys = sorted(q["options"], key=int)
    options = [
        {
            "id": letter(key),
            "text": q["options"][key],
            "correct": int(key) in answers,
            "rationale": q["rationales"][key],
        }
        for key in keys
    ]
    multi = q["type"] == "select_all" or len(answers) > 1
    out = {
        "id": q["id"],
        "type": "sata" if multi else "multiple_choice",
        "stem": q["stem"],
        "options": options,
        "answer": [letter(a) for a in answers] if multi else letter(answers[0]),
        "takeaway": "",
    }
    if q.get("decision_tree_step"):
        out["strategy"] = q["decision_tree_step"]
    if q.get("client_needs"):
        out["coverage"] = q["client_needs"]
    return out


def bank(exam, questions):
    topics = {}
    for q in questions:
        topics.setdefault(q["topic"], []).append(convert(q))
    skills = [
        {
            "id": re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-"),
            "title": name,
            "questions": topics[name],
        }
        for name in sorted(topics, key=str.lower)
    ]
    return {
        "meta": {"course": "Kaplan practice questions", "textbook": "Kaplan", "exam": exam},
        "chapters": [],
        "skills": skills,
    }


def main(path):
    data = json.load(open(path))
    OUT.mkdir(parents=True, exist_ok=True)
    manifest_path = OUT / "manifest.json"
    manifest = json.load(open(manifest_path)) if manifest_path.exists() else []
    known = {entry["id"]: entry for entry in manifest}

    for exam, questions in data.items():
        number = re.sub(r"\D", "", exam)
        exam_id = f"exam{number}"
        (OUT / f"{exam_id}.json").write_text(
            json.dumps(bank(exam, questions), indent=1, ensure_ascii=False) + "\n"
        )
        known[exam_id] = {"id": exam_id, "title": exam}
        print(f"{exam}: {len(questions)} questions -> kaplan/{exam_id}.json")

    ordered = sorted(known.values(), key=lambda entry: int(re.sub(r"\D", "", entry["id"])))
    manifest_path.write_text(json.dumps(ordered, indent=1) + "\n")


if __name__ == "__main__":
    main(sys.argv[1])
