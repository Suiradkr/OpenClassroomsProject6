"""Seed script: build data/users.json from the unique usernames in the ETL data.

This is the "add a password + role field to the ETL data" step. Every existing
username gets:
  - password_hash for the demo password "test123"
  - a role: 4 usernames (chosen at random with a fixed seed for reproducibility)
    become "admin"; the rest are "user".

Login-only internal tool: accounts are seeded here, never self-registered.
Run once:  python seed_users.py
"""
import json
import os
import random

from werkzeug.security import generate_password_hash

from etl.vm_data_manager import DATA_DIR

DEMO_PASSWORD = "test123"
NUM_ADMINS = 4
RANDOM_SEED = 42

DETAILS_FILE = os.path.join(DATA_DIR, 'get_vm_details.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')


def unique_usernames():
    with open(DETAILS_FILE, 'r') as f:
        details = json.load(f)
    names = sorted({e['username'] for e in details
                    if isinstance(e, dict) and e.get('username')})
    return names


def build_users():
    names = unique_usernames()
    rng = random.Random(RANDOM_SEED)
    admins = set(rng.sample(names, min(NUM_ADMINS, len(names))))

    users = []
    for name in names:
        users.append({
            "username": name,
            "password_hash": generate_password_hash(DEMO_PASSWORD),
            "role": "admin" if name in admins else "user",
        })
    return users, admins


def main():
    users, admins = build_users()
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)
    print(f"Wrote {len(users)} users to {USERS_FILE}")
    print(f"Password for every user: {DEMO_PASSWORD!r}")
    print(f"Admins ({len(admins)}): {', '.join(sorted(admins))}")


if __name__ == '__main__':
    main()
