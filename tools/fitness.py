#!/usr/bin/env python3
import json
import argparse
import subprocess
from datetime import date
from pathlib import Path

DATA_FILE = Path("static/data/fitness.json")

def load_data():
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    return {}

def save_data(data):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

def git_commit(msg):
    subprocess.run(["git", "add", str(DATA_FILE)], check=True)
    subprocess.run(["git", "commit", "-m", msg], check=True)

def main():
    parser = argparse.ArgumentParser("fitness log")
    parser.add_argument("--run", type=int, default=0)
    parser.add_argument("--walk", type=int, default=0)
    parser.add_argument("--bike", type=int, default=0)
    parser.add_argument("--strength", type=int, default=0)
    parser.add_argument("--note", type=str, default="")
    parser.add_argument("--date", type=str, default=str(date.today()))
    parser.add_argument("--no-commit", action="store_true")

    args = parser.parse_args()

    total = args.run + args.walk + args.bike + args.strength
    if total <= 0:
        print("No activity provided.")
        return

    data = load_data()
    d = args.date

    entry = data.get(d, {
        "minutes": 0,
        "sessions": 0,
        "types": [],
        "note": ""
    })

    entry["minutes"] += total
    entry["sessions"] += 1
    entry["types"] = sorted(set(
        entry["types"] +
        [k for k in ["run", "walk", "bike", "strength"] if getattr(args, k) > 0]
    ))

    if args.note:
        entry["note"] = args.note

    data[d] = entry
    save_data(data)

    if not args.no_commit:
        git_commit(f"fitness: {d} {total}min")

    print(f"✔ {d} logged: {total} minutes")

if __name__ == "__main__":
    main()
