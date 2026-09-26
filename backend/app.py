from flask import Flask
from flask_cors import CORS
from mail_config import mail
import os

from dotenv import load_dotenv

from database import db
from routes.auth import auth_bp
from routes.robot import robot_bp


# Load .env file
load_dotenv()


app = Flask(__name__)


# =====================================
# MAIL CONFIGURATION
# =====================================

app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True

app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")


mail.init_app(app)


# =====================================
# CORS
# =====================================

CORS(app)


# =====================================
# REGISTER ROUTES
# =====================================

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    robot_bp,
    url_prefix="/api/robot"
)


# =====================================
# HOME
# =====================================

@app.route("/")
def home():

    return {
        "message": "RoboDog Backend is Running"
    }


# =====================================
# TEST DATABASE
# =====================================

@app.route("/test-db")
def test_db():

    try:

        db.command("ping")

        return {
            "message": "MongoDB Connected Successfully!"
        }

    except Exception as e:

        return {
            "message": "MongoDB Connection Failed",
            "error": str(e)
        }, 500


# =====================================
# RUN SERVER
# =====================================

if __name__ == "__main__":

    app.run(debug=True, port=5050)