"""
Application factory. Registers blueprints and the WebSocket layer.
"""
from flask import Flask, jsonify
from flask_cors import CORS

from app.config import config
from app.sockets import socketio, register_socket_handlers
from app.routes.packets import packets_bp
from app.routes.network import network_bp
from app.routes.alerts import alerts_bp
from app.routes.learning import learning_bp


def create_app() -> Flask:
    import sys
    import os

    # Identify where the frontend dist directory is located
    if getattr(sys, 'frozen', False):
        # Running inside PyInstaller bundle
        base_dir = sys._MEIPASS
        static_dir = os.path.join(base_dir, 'frontend', 'dist')
    else:
        # Running in dev mode
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # VISTA/backend
        static_dir = os.path.join(os.path.dirname(base_dir), 'frontend', 'dist')  # VISTA/frontend/dist

    app = Flask(__name__, static_folder=static_dir, static_url_path='/')
    CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGIN}})

    app.register_blueprint(packets_bp)
    app.register_blueprint(network_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(learning_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "VISTA backend"})

    # SPA Router Catch-all route to serve built React files
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return app.send_static_file(path)
        return app.send_static_file('index.html')

    register_socket_handlers()
    socketio.init_app(app)

    return app
