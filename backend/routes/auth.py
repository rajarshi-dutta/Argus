from flask import Blueprint, request, jsonify

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from database import (
    users_collection,
    password_resets_collection
)

import os
import random
import datetime

from flask_mail import Message
from dotenv import load_dotenv
from mail_config import mail


load_dotenv()


auth_bp = Blueprint("auth", __name__)


# =====================================
# REGISTER
# =====================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "message": "All fields are required"
        }), 400

    existing_user = users_collection.find_one({
        "email": email
    })

    if existing_user:
        return jsonify({
            "message": "Email already registered"
        }), 409

    hashed_password = generate_password_hash(password)

    user = {
        "name": name,
        "email": email,
        "password": hashed_password
    }

    users_collection.insert_one(user)

    return jsonify({
        "message": "Registration successful"
    }), 201


# =====================================
# LOGIN
# =====================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    if not check_password_hash(
        user["password"],
        password
    ):
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    # =====================================
    # SEND LOGIN CONFIRMATION EMAIL
    # =====================================

    try:

        msg = Message(
            subject="RoboDog Login Successful 🐕",

            sender=os.getenv(
                "MAIL_USERNAME"
            ),

            recipients=[
                user["email"]
            ]
        )

        msg.body = f"""
Hello {user["name"]},

You have successfully logged in
to your RoboDog account.

Login Email:
{user["email"]}

Login Status:
Successful ✅

If you did not perform this login,
please secure your account.

Regards,

RoboDog Team
"""

        # Send email
        mail.send(msg)

        print(
            "Login confirmation email sent successfully!"
        )

    except Exception as e:

        print(
            "Login email could not be sent:",
            e
        )

    # =====================================
    # LOGIN SUCCESS
    # =====================================

    return jsonify({

        "message": "Login successful",

        "user": {
            "name": user["name"],
            "email": user["email"]
        }

    }), 200


# =====================================
# FORGOT PASSWORD - SEND OTP
# =====================================

@auth_bp.route(
    "/forgot-password",
    methods=["POST"]
)
def forgot_password():

    data = request.get_json()

    email = data.get("email")

    if not email:

        return jsonify({
            "message": "Email is required"
        }), 400

    user = users_collection.find_one({
        "email": email
    })

    if not user:

        return jsonify({
            "message": "Email is not registered"
        }), 404

    # =====================================
    # GENERATE 6 DIGIT OTP
    # =====================================

    otp = str(
        random.randint(
            100000,
            999999
        )
    )

    # =====================================
    # REMOVE OLD OTP
    # =====================================

    password_resets_collection.delete_many({
        "email": email
    })

    # =====================================
    # OTP EXPIRY - 5 MINUTES
    # =====================================

    expires_at = (
        datetime.datetime.now(
            datetime.timezone.utc
        )
        + datetime.timedelta(
            minutes=5
        )
    ).replace(
        tzinfo=None
    )

    # =====================================
    # SAVE OTP IN MONGODB
    # =====================================

    password_resets_collection.insert_one({

        "email": email,

        "otp": otp,

        "expires_at": expires_at

    })

    print(
        "OTP saved in MongoDB:",
        email,
        otp
    )

    # =====================================
    # CREATE OTP EMAIL
    # =====================================

    msg = Message(

        subject="RoboDog Password Reset OTP",

        sender=os.getenv(
            "MAIL_USERNAME"
        ),

        recipients=[
            email
        ]
    )

    msg.body = f"""
Hello,

Your RoboDog password reset OTP is:

{otp}

This OTP is valid for 5 minutes.

This OTP is required to reset your password.

If you did not request a password reset,
please ignore this email.

Regards,

RoboDog Team
"""

    # =====================================
    # SEND EMAIL (now crash-safe)
    # =====================================

    try:
        mail.send(msg)
    except Exception as e:
        print("OTP email could not be sent:", e)
        return jsonify({
            "message": "Could not send OTP email. Please try again later."
        }), 500

    return jsonify({

        "message":
        "OTP sent successfully to your email"

    }), 200


# =====================================
# VERIFY OTP
# =====================================

@auth_bp.route(
    "/verify-otp",
    methods=["POST"]
)
def verify_otp():

    data = request.get_json()

    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:

        return jsonify({
            "message":
            "Email and OTP are required"
        }), 400

    reset_data = password_resets_collection.find_one({

        "email": email,

        "otp": otp

    })

    if not reset_data:

        return jsonify({
            "message":
            "Invalid OTP"
        }), 400

    expires_at = reset_data.get(
        "expires_at"
    )

    if not expires_at:

        return jsonify({
            "message":
            "OTP has expired. Please request a new OTP."
        }), 400

    current_time = (
        datetime.datetime.now(
            datetime.timezone.utc
        )
    ).replace(
        tzinfo=None
    )

    if expires_at < current_time:

        password_resets_collection.delete_many({
            "email": email
        })

        return jsonify({
            "message":
            "OTP has expired. Please request a new OTP."
        }), 400

    return jsonify({

        "message":
        "OTP verified successfully"

    }), 200


# =====================================
# RESET PASSWORD
# =====================================

@auth_bp.route(
    "/reset-password",
    methods=["POST"]
)
def reset_password():

    data = request.get_json()

    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get(
        "new_password"
    )

    if (
        not email
        or not otp
        or not new_password
    ):

        return jsonify({

            "message":
            "Email, OTP and new password are required"

        }), 400

    reset_data = password_resets_collection.find_one({

        "email": email,

        "otp": otp

    })

    if not reset_data:

        return jsonify({
            "message":
            "Invalid OTP"
        }), 400

    expires_at = reset_data.get(
        "expires_at"
    )

    if not expires_at:

        return jsonify({
            "message":
            "OTP has expired. Please request a new OTP."
        }), 400

    current_time = (
        datetime.datetime.now(
            datetime.timezone.utc
        )
    ).replace(
        tzinfo=None
    )

    if expires_at < current_time:

        return jsonify({
            "message":
            "OTP has expired. Please request a new OTP."
        }), 400

    hashed_password = generate_password_hash(
        new_password
    )

    result = users_collection.update_one(

        {
            "email": email
        },

        {
            "$set": {
                "password":
                hashed_password
            }
        }

    )

    if result.modified_count == 0:

        return jsonify({

            "message":
            "Password could not be updated"

        }), 400

    print(
        "Password reset successful for:",
        email
    )

    return jsonify({

        "message":
        "Password reset successfully"

    }), 200