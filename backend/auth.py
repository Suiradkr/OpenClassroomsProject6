"""JWT auth helpers: issue tokens on login and protect routes.

Login-only: the only way to obtain a token is POST /api/login with a seeded
account. There is deliberately no registration.
"""
import datetime
import os
from functools import wraps

import jwt
from flask import request, jsonify, g

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
TOKEN_TTL_HOURS = 8
ALGORITHM = 'HS256'


def create_token(username, role):
    payload = {
        'sub': username,
        'role': role,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(
            hours=TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        token = auth_header.split(' ', 1)[1].strip()
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        g.username = payload['sub']
        g.role = payload.get('role', 'user')
        return f(*args, **kwargs)

    return wrapper
