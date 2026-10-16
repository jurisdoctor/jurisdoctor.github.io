#!/usr/bin/env python3
import json
import sys
from pathlib import Path

src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Downloads/medications.json"
out = Path(__file__).resolve().parent.parent / "src/app/components/Medications"

full = json.loads(src.read_text(encoding="utf8"))
inter = full["interactions"]

guide = {k: full[k] for k in ("schema_version", "generated", "stats", "groups", "medications")}
guide["filters"] = {
    "families": full["filters"]["families"],
    "label_of": full["filters"]["label_of"],
}
guide["course_list"] = full["course_list"]
guide["stats"] = {k: v for k, v in guide["stats"].items() if k != "corrections_applied"}

KEEP = (
    "id", "generic", "pronunciation", "brand", "group", "drug_class", "subclass",
    "highlight", "quick", "why_this_one", "use", "working_because",
    "high_alert", "black_box", "antidote", "sections", "must_check",
    "tags", "nclex", "condensed",
)
slim = []
for med in guide["medications"]:
    kept = {k: med[k] for k in KEEP}
    kept["flashcard"] = med["flashcard"]
    slim.append(kept)
guide["medications"] = slim

rules = [
    {k: rule[k] for k in ("id", "name", "severity", "mechanism", "watch", "exam", "brief") if k in rule}
    for rule in inter["rules"]
]
pairs = [
    {
        "a": pair["a"],
        "b": pair["b"],
        "severity": pair["severity"],
        "rules": [
            {
                "rule": r["rule"],
                "severity": r["severity"],
                "why": r["why"],
                **({"highest": True} if r.get("highest_risk_in_rule") else {}),
            }
            for r in pair["rules"]
        ],
    }
    for pair in inter["pairs"]
]
interactions = {
    "note": inter["note"],
    "severity_key": inter["severity_key"],
    "rules": rules,
    "pairs": pairs,
    "clean": inter["no_significant_interactions"]["drugs"],
    "clean_note": inter["no_significant_interactions"]["note"],
}

def dump(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    print(f"{path.name}: {path.stat().st_size // 1024} KB")

patient = {
    "doc": full["patient_states"],
    "meds": {
        med["id"]: med["patient_states"]
        for med in full["medications"]
        if med.get("patient_states")
    },
    "pairs": {
        "|".join(sorted((pair["a"], pair["b"]))): pair["in_patient"]
        for pair in inter["pairs"]
        if pair.get("in_patient")
    },
}

dump(out / "medications.json", guide)
dump(out / "interactions.json", interactions)
dump(out / "patient.json", patient)
