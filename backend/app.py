from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

from mail_config import mail
from database import db
from routes.auth import auth_bp
from routes.robot import robot_bp

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("JWT_SECRET", "super-secret-key")

# 1. Initialize SocketIO with CORS enabled
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Mail Configuration
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
mail.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(robot_bp, url_prefix="/api/robot")

# ==========================================
# WEBSOCKET EVENT LISTENERS
# ==========================================

@socketio.on('connect')
def handle_connect():
    print("Client connected to WebSocket")

@socketio.on('camera_frame')
def handle_camera_frame(data):
    """Receive frame from Pi and broadcast to all connected dashboards"""
    # Verify token to prevent unauthorized streaming
    if data.get('token') != os.getenv("CAMERA_PUSH_TOKEN"):
        return
    
    # Broadcast the base64 image to all connected frontend clients
    socketio.emit('new_frame', {'image': data['image']}, broadcast=True)

if __name__ == "__main__":
    # 2. Use socketio.run instead of app.run
    port = int(os.environ.get("PORT", 5050))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)