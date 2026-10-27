
from flask import Flask
from flask_cors import CORS

from .routes import api


def create_app():
    app = Flask(__name__)

    # Allow your frontend running on port 5500 to call the backend.
    CORS(app)

    # Register weather API endpoints under /api.
    app.register_blueprint(api)

    return app
