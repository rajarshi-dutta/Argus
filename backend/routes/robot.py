from flask import Blueprint, jsonify, request, Response
from database import alerts_collection, db
import datetime
import os
import time

robot_bp = Blueprint("robot", __name__)

# =====================================================
# MONGODB ROBOT STATE
# =====================================================

robot_state_collection = db["robot_state"]

# Create default robot state if it does not exist
existing_state = robot_state_collection.find_one({"_id": "robodog"})

if not existing_state:
    robot_state_collection.insert_one({
        "_id": "robodog",
        "current_command": "stop",
        "battery": 85
    })

# =====================================================
# OTHER ROBOT VARIABLES
# =====================================================

patrol_status = "inactive"

intruder_status = "No Intruder"
intruder_count = 0
suspicion_rate = 0

disaster_status = "No Disaster"
disaster_type = None
disaster_confidence = 0

# =====================================================
# HELPER FUNCTION
# =====================================================

def update_command(command):
    robot_state_collection.update_one(
        {"_id": "robodog"},
        {
            "$set": {
                "current_command": command
            }
        },
        upsert=True
    )


# =====================================================
# ROBOT STATUS
# =====================================================

@robot_bp.route("/status", methods=["GET"])
def status():

    state = robot_state_collection.find_one(
        {"_id": "robodog"}
    )

    if not state:
        state = {
            "current_command": "stop",
            "battery": 85
        }

    return jsonify({
        "status": "online",
        "command": state.get(
            "current_command",
            "stop"
        ),
        "battery": state.get(
            "battery",
            85
        )
    })


# =====================================================
# FORWARD
# =====================================================

@robot_bp.route("/forward", methods=["POST"])
def forward():

    update_command("forward")

    return jsonify({
        "message": "Robot moving forward",
        "command": "forward"
    })


# =====================================================
# BACKWARD
# =====================================================

@robot_bp.route("/backward", methods=["POST"])
def backward():

    update_command("backward")

    return jsonify({
        "message": "Robot moving backward",
        "command": "backward"
    })


# =====================================================
# LEFT
# =====================================================

@robot_bp.route("/left", methods=["POST"])
def left():

    update_command("left")

    return jsonify({
        "message": "Robot turning left",
        "command": "left"
    })


# =====================================================
# RIGHT
# =====================================================

@robot_bp.route("/right", methods=["POST"])
def right():

    update_command("right")

    return jsonify({
        "message": "Robot turning right",
        "command": "right"
    })


# =====================================================
# STOP
# =====================================================

@robot_bp.route("/stop", methods=["POST"])
def stop():

    update_command("stop")

    return jsonify({
        "message": "Robot stopped",
        "command": "stop"
    })


# =====================================================
# PATROL START
# =====================================================

@robot_bp.route("/patrol/start", methods=["POST"])
def start_patrol():

    global patrol_status

    patrol_status = "active"

    update_command("patrol")

    return jsonify({
        "message": "Patrol started",
        "patrol_status": patrol_status,
        "command": "patrol"
    })


# =====================================================
# PATROL STOP
# =====================================================

@robot_bp.route("/patrol/stop", methods=["POST"])
def stop_patrol():

    global patrol_status

    patrol_status = "inactive"

    update_command("stop")

    return jsonify({
        "message": "Patrol stopped",
        "patrol_status": patrol_status,
        "command": "stop"
    })


# =====================================================
# PATROL STATUS
# =====================================================

@robot_bp.route("/patrol/status", methods=["GET"])
def get_patrol_status():

    return jsonify({
        "patrol_status": patrol_status
    })


# =====================================================
# INTRUDER TEST
# =====================================================

@robot_bp.route("/intruder/test", methods=["POST"])
def test_intruder():

    global intruder_status
    global intruder_count
    global suspicion_rate

    intruder_status = "Intruder Detected"
    intruder_count = 1
    suspicion_rate = 85

    alert = {
        "type": "Intruder",
        "message": "Suspicious person detected",
        "confidence": suspicion_rate,
        "status": "Intruder Detected",
        "created_at": datetime.datetime.utcnow()
    }

    alerts_collection.insert_one(alert)

    return jsonify({
        "status": intruder_status,
        "count": intruder_count,
        "suspicion_rate": suspicion_rate
    })


# =====================================================
# INTRUDER RESET
# =====================================================

@robot_bp.route("/intruder/reset", methods=["POST"])
def reset_intruder():

    global intruder_status
    global intruder_count
    global suspicion_rate

    intruder_status = "No Intruder"
    intruder_count = 0
    suspicion_rate = 0

    return jsonify({
        "status": intruder_status,
        "count": intruder_count,
        "suspicion_rate": suspicion_rate
    })


# =====================================================
# INTRUDER STATUS
# =====================================================

@robot_bp.route("/intruder/status", methods=["GET"])
def get_intruder_status():

    return jsonify({
        "status": intruder_status,
        "count": intruder_count,
        "suspicion_rate": suspicion_rate
    })


# =====================================================
# DISASTER TEST
# =====================================================

@robot_bp.route("/disaster/test", methods=["POST"])
def test_disaster():

    global disaster_status
    global disaster_type
    global disaster_confidence

    disaster_status = "Disaster Detected"
    disaster_type = "Fire"
    disaster_confidence = 92

    alert = {
        "type": disaster_type,
        "message": "Fire detected",
        "confidence": disaster_confidence,
        "status": disaster_status,
        "created_at": datetime.datetime.utcnow()
    }

    alerts_collection.insert_one(alert)

    return jsonify({
        "status": disaster_status,
        "type": disaster_type,
        "confidence": disaster_confidence
    })


# =====================================================
# DISASTER RESET
# =====================================================

@robot_bp.route("/disaster/reset", methods=["POST"])
def reset_disaster():

    global disaster_status
    global disaster_type
    global disaster_confidence

    disaster_status = "No Disaster"
    disaster_type = None
    disaster_confidence = 0

    return jsonify({
        "status": disaster_status,
        "type": disaster_type,
        "confidence": disaster_confidence
    })


# =====================================================
# DISASTER STATUS
# =====================================================

@robot_bp.route("/disaster/status", methods=["GET"])
def get_disaster_status():

    return jsonify({
        "status": disaster_status,
        "type": disaster_type,
        "confidence": disaster_confidence
    })


# =====================================================
# ALERT HISTORY
# =====================================================

@robot_bp.route("/alerts", methods=["GET"])
def get_alerts():

    alerts = list(
        alerts_collection
        .find()
        .sort("created_at", -1)
        .limit(50)
    )

    result = []

    for alert in alerts:

        result.append({
            "type": alert.get("type"),
            "message": alert.get("message"),
            "confidence": alert.get("confidence"),
            "status": alert.get("status"),
            "created_at": alert.get("created_at")
        })

    return jsonify(result)


# =====================================================
# ALERT COUNT
# =====================================================

@robot_bp.route("/alerts/count", methods=["GET"])
def get_alert_count():

    count = alerts_collection.count_documents({})

    return jsonify({
        "count": count
    })


# =====================================================
# CLEAR ALERTS
# =====================================================

@robot_bp.route("/alerts/clear", methods=["DELETE"])
def clear_alerts():

    alerts_collection.delete_many({})

    return jsonify({
        "message": "All alerts cleared"
    })


# =====================================================
# CAMERA FEED RELAY
# =====================================================
# The Pi (in Kolkata) pushes JPEG frames here with each POST.
# The web dashboard (anywhere in the world) reads them back out
# as an MJPEG stream. Render is the public middleman — neither
# side needs to be reachable directly.

_latest_frame_bytes = None
_latest_frame_time = 0
CAMERA_FRAME_TIMEOUT = 5  # seconds — feed is "offline" if no frame this recent

# Simple shared-secret so randoms on the internet can't spam your frame buffer
CAMERA_PUSH_TOKEN = os.getenv("CAMERA_PUSH_TOKEN", "change-me")


@robot_bp.route("/camera/frame", methods=["POST"])
def receive_camera_frame():
    """Pi calls this repeatedly, posting raw JPEG bytes as the body."""
    global _latest_frame_bytes, _latest_frame_time

    token = request.headers.get("X-Camera-Token")
    if token != CAMERA_PUSH_TOKEN:
        return jsonify({"message": "Unauthorized"}), 401

    frame_bytes = request.get_data()

    if not frame_bytes:
        return jsonify({"message": "No frame data received"}), 400

    _latest_frame_bytes = frame_bytes
    _latest_frame_time = time.time()

    return jsonify({"message": "Frame received"}), 200


def _mjpeg_relay_generator():
    """Re-serves whatever frame was most recently pushed, as MJPEG."""
    last_sent_time = 0

    while True:
        if _latest_frame_bytes is not None and _latest_frame_time != last_sent_time:
            last_sent_time = _latest_frame_time
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + _latest_frame_bytes + b"\r\n"
            )

        time.sleep(0.05)  # ~20fps max relay rate, avoids busy-looping


@robot_bp.route("/camera/feed", methods=["GET"])
def camera_feed():
    """Dashboard <img> tag points here."""
    return Response(
        _mjpeg_relay_generator(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@robot_bp.route("/camera/status", methods=["GET"])
def camera_status():
    """Dashboard can poll this to show Online/Offline without loading the stream."""
    is_online = (
        _latest_frame_bytes is not None
        and (time.time() - _latest_frame_time) < CAMERA_FRAME_TIMEOUT
    )
    return jsonify({
        "online": is_online,
        "last_frame_seconds_ago": (
            round(time.time() - _latest_frame_time, 1)
            if _latest_frame_time else None
        )
    })


# =====================================================
# ROBOT LOCATION
# =====================================================

robot_location = {
    "latitude": 22.5726,
    "longitude": 88.3639,
    "location": "Kolkata"
}


@robot_bp.route("/location", methods=["GET"])
def get_location():

    return jsonify(robot_location)


# =====================================================
# UPDATE ROBOT LOCATION
# =====================================================

@robot_bp.route("/location/update", methods=["POST"])
def update_location():

    global robot_location

    data = request.get_json()

    latitude = data.get("latitude")
    longitude = data.get("longitude")
    location = data.get("location")

    if latitude is not None:
        robot_location["latitude"] = latitude

    if longitude is not None:
        robot_location["longitude"] = longitude

    if location:
        robot_location["location"] = location

    return jsonify({
        "message": "Robot location updated",
        "location": robot_location
    })


# =====================================================
# NEXT STOP
# =====================================================

next_stop = {
    "name": "Park Street",
    "distance": "500 m"
}


@robot_bp.route("/next-stop", methods=["GET"])
def get_next_stop():

    return jsonify(next_stop)


# =====================================================
# UPDATE NEXT STOP
# =====================================================

@robot_bp.route("/next-stop/update", methods=["POST"])
def update_next_stop():

    global next_stop

    data = request.get_json()

    if data.get("name"):
        next_stop["name"] = data.get("name")

    if data.get("distance"):
        next_stop["distance"] = data.get("distance")

    return jsonify({
        "message": "Next stop updated",
        "next_stop": next_stop
    })