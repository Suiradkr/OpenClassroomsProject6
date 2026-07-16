"""Flask API for the Cluster Manager internal tool.

Endpoints:
  POST   /api/login            {username, password} -> {token, username, role}
  GET    /api/me               -> {username, role}
  GET    /api/clusters?scope=  mine|all (+ search, status) -> [clusters]
  DELETE /api/clusters/<id>    -> soft-delete (own cluster, or admin)

Login-only: no registration route exists.
"""
from flask import Flask, request, jsonify, g
from flask_cors import CORS

import users
from auth import create_token, token_required
from etl import cluster_service


def create_app():
    app = Flask(__name__)
    CORS(app)  # dev: allow the Vite origin

    @app.post('/api/login')
    def login():
        data = request.get_json(silent=True) or {}
        username = (data.get('username') or '').strip()
        password = data.get('password') or ''
        if not username or not password:
            return jsonify({'error': 'username and password are required'}), 400
        if not users.verify_password(username, password):
            return jsonify({'error': 'Invalid username or password'}), 401
        role = users.get_role(username)
        token = create_token(username, role)
        return jsonify({'token': token, 'username': username, 'role': role})

    @app.get('/api/me')
    @token_required
    def me():
        return jsonify({'username': g.username, 'role': g.role})

    @app.get('/api/clusters')
    @token_required
    def list_clusters():
        scope = request.args.get('scope', 'mine')
        search = (request.args.get('search') or '').strip().lower()
        status = (request.args.get('status') or '').strip().lower()

        clusters = cluster_service.get_all_clusters()

        if scope == 'mine':
            clusters = [c for c in clusters if c['username'] == g.username]

        if status:
            clusters = [c for c in clusters
                        if c['status'].lower() == status]

        if search:
            clusters = [
                c for c in clusters
                if search in str(c['id']).lower()
                or search in c['username'].lower()
                or search in c['podbox'].lower()
            ]

        is_admin = g.role == 'admin'
        for c in clusters:
            c['canDelete'] = is_admin or c['username'] == g.username

        return jsonify(clusters)

    @app.delete('/api/clusters/<int:cluster_id>')
    @token_required
    def delete_cluster(cluster_id):
        cluster = cluster_service.get_cluster(cluster_id)
        if cluster is None:
            return jsonify({'error': 'Cluster not found'}), 404
        if g.role != 'admin' and cluster['username'] != g.username:
            return jsonify(
                {'error': "You can only delete your own clusters"}), 403
        cluster_service.delete_cluster(cluster_id)
        return jsonify({'deleted': cluster_id})

    return app


app = create_app()


if __name__ == '__main__':
    app.run(port=5001, debug=True)
