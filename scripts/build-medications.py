#!/usr/bin/env python3
"""Turn the full medications.json export into the two files the site ships.

    python3 scripts/build-medications.py ~/Downloads/medications.json

The full export also carries the study-card editing log (`corrections`, plus
the file-level `source` and `conventions`), per-card `interaction_tags`, and
flat copies of what `sections` already lays out. Those are for whoever
maintains the data, or are duplicates, so they are left out of what the site
serves:

  src/app/components/Medications/medications.json   the guide itself
  src/app/components/Medications/interactions.json  the interaction map data,
                                                    loaded only on that page

Keep the full export somewhere safe (e.g. the nclex-bank folder).
"""
import json
import sys
from pathlib import Path

src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Downloads/medications.json"
out = Path(__file__).resolve().parent.parent / "src/app/components/Medications"

full = json.loads(src.read_text(encoding="utf8"))
inter = full["interactions"]

guide = {k: full[k] for k in ("schema_version", "generated", "stats", "groups", "medications")}
guide["stats"] = {k: v for k, v in guide["stats"].items() if k != "corrections_applied"}

# Everything the pages and the flashcards read; everything else is dropped.
# The per-section content (action, contraindications, side effects, nursing,
# ...) is already laid out in `sections`, so the older flat copies of it are
# not shipped a second time.
KEEP = (
    "id", "generic", "pronunciation", "brand", "group", "drug_class", "subclass",
    "highlight", "quick", "why_this_one", "use", "working_because",
    "high_alert", "black_box", "antidote", "sections", "must_check",
)
slim = []
for med in guide["medications"]:
    kept = {k: med[k] for k in KEEP}
    # The medication card on the page is drawn from `flashcard`, and the
    # flashcards read its serious side effects, so it ships whole.
    kept["flashcard"] = med["flashcard"]
    slim.append(kept)
guide["medications"] = slim

rules = [
    {k: rule[k] for k in ("id", "name", "severity", "mechanism", "watch", "exam") if k in rule}
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

dump(out / "medications.json", guide)
dump(out / "interactions.json", interactions)
