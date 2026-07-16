"""User store: loads the seeded users.json (username, password_hash, role)
and checks credentials. Login-only — there is no create/register here.
"""
import json
import os

from werkzeug.security import check_password_hash

from etl.vm_data_manager import DATA_DIR

USERS_FILE = os.path.join(DATA_DIR, 'users.json')


def load_users():
    with open(USERS_FILE, 'r') as f:
        return json.load(f)


def get_user(username):
    for user in load_users():
        if user['username'] == username:
            return user
    return None


def verify_password(username, password):
    user = get_user(username)
    if user is None:
        return False
    return check_password_hash(user['password_hash'], password)


def get_role(username):
    user = get_user(username)
    if user is None:
        return None
    return user['role']
