from flask import Blueprint, jsonify, request, Response
from flask_socketio import emit
from database import alerts_collection, db
import datetime
import os
import time
import base64

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
# HELPER FUNCTIONS (WEBSOCKET BROADCASTS)
# =====================================================

def broadcast_robot_status(command):
    """Pushes the new command to all connected dashboard clients instantly."""
    emit('robot_status_update', {
        "status": "online",
        "command": command,
        "battery": 85
    }, namespace='/', broadcast=True)


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
    # Broadcast the new state to eliminate frontend polling
    broadcast_robot_status(command)


# =====================================================
# ROBOT STATUS
# =====================================================

@robot_bp.route("/status", methods=["GET"])
def status():
    state = robot_state_collection.find_one({"_id": "robodog"})
    if not state:
        state = {"current_command": "stop", "battery": 85}

    return jsonify({
        "status": "online",
        "command": state.get("current_command", "stop"),
        "battery": state.get("battery", 85)
    })

# =====================================================
# MOVEMENT CONTROLS
# =====================================================

@robot_bp.route("/forward", methods=["POST"])
def forward():
    update_command("forward")
    return jsonify({"message": "Robot moving forward", "command": "forward"})

@robot_bp.route("/backward", methods=["POST"])
def backward():
    update_command("backward")
    return jsonify({"message": "Robot moving backward", "command": "backward"})

@robot_bp.route("/left", methods=["POST"])
def left():
    update_command("left")
    return jsonify({"message": "Robot turning left", "command": "left"})

@robot_bp.route("/right", methods=["POST"])
def right():
    update_command("right")
    return jsonify({"message": "Robot turning right", "command": "right"})

@robot_bp.route("/stop", methods=["POST"])
def stop():
    update_command("stop")
    return jsonify({"message": "Robot stopped", "command": "stop"})


# =====================================================
# PATROL MANAGEMENT
# =====================================================

@robot_bp.route("/patrol/start", methods=["POST"])
def start_patrol():
    global patrol_status
    patrol_status = "active"
    update_command("patrol")
    
    emit('patrol_status_update', {"patrol_status": patrol_status}, namespace='/', broadcast=True)
    return jsonify({"message": "Patrol started", "patrol_status": patrol_status, "command": "patrol"})

@robot_bp.route("/patrol/stop", methods=["POST"])
def stop_patrol():
    global patrol_status
    patrol_status = "inactive"
    update_command("stop")
    
    emit('patrol_status_update', {"patrol_status": patrol_status}, namespace='/', broadcast=True)
    return jsonify({"message": "Patrol stopped", "patrol_status": patrol_status, "command": "stop"})

@robot_bp.route("/patrol/status", methods=["GET"])
def get_patrol_status():
    return jsonify({"patrol_status": patrol_status})


# =====================================================
# INTRUDER DETECTION
# =====================================================

@robot_bp.route("/intruder/test", methods=["POST"])
def test_intruder():
    global intruder_status, intruder_count, suspicion_rate

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

    # Push alert to dashboard immediately
    emit('security_alert', {
        "type": "Intruder", 
        "status": intruder_status, 
        "count": intruder_count, 
        "suspicion_rate": suspicion_rate
    }, namespace='/', broadcast=True)

    return jsonify({"status": intruder_status, "count": intruder_count, "suspicion_rate": suspicion_rate})

@robot_bp.route("/intruder/reset", methods=["POST"])
def reset_intruder():
    global intruder_status, intruder_count, suspicion_rate

    intruder_status = "No Intruder"
    intruder_count = 0
    suspicion_rate = 0
    
    emit('security_alert', {
        "type": "Intruder", 
        "status": intruder_status, 
        "count": intruder_count, 
        "suspicion_rate": suspicion_rate
    }, namespace='/', broadcast=True)

    return jsonify({"status": intruder_status, "count": intruder_count, "suspicion_rate": suspicion_rate})

@robot_bp.route("/intruder/status", methods=["GET"])
def get_intruder_status():
    return jsonify({"status": intruder_status, "count": intruder_count, "suspicion_rate": suspicion_rate})


# =====================================================
# DISASTER DETECTION
# =====================================================

@robot_bp.route("/disaster/test", methods=["POST"])
def test_disaster():
    global disaster_status, disaster_type, disaster_confidence

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

    emit('security_alert', {
        "type": "Disaster",
        "status": disaster_status,
        "disaster_type": disaster_type,
        "confidence": disaster_confidence
    }, namespace='/', broadcast=True)

    return jsonify({"status": disaster_status, "type": disaster_type, "confidence": disaster_confidence})

@robot_bp.route("/disaster/reset", methods=["POST"])
def reset_disaster():
    global disaster_status, disaster_type, disaster_confidence

    disaster_status = "No Disaster"
    disaster_type = None
    disaster_confidence = 0

    emit('security_alert', {
        "type": "Disaster",
        "status": disaster_status,
        "disaster_type": disaster_type,
        "confidence": disaster_confidence
    }, namespace='/', broadcast=True)

    return jsonify({"status": disaster_status, "type": disaster_type, "confidence": disaster_confidence})

@robot_bp.route("/disaster/status", methods=["GET"])
def get_disaster_status():
    return jsonify({"status": disaster_status, "type": disaster_type, "confidence": disaster_confidence})


# =====================================================
# ALERT HISTORY
# =====================================================

@robot_bp.route("/alerts", methods=["GET"])
def get_alerts():
    alerts = list(alerts_collection.find().sort("created_at", -1).limit(50))
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

@robot_bp.route("/alerts/count", methods=["GET"])
def get_alert_count():
    count = alerts_collection.count_documents({})
    return jsonify({"count": count})

@robot_bp.route("/alerts/clear", methods=["DELETE"])
def clear_alerts():
    alerts_collection.delete_many({})
    return jsonify({"message": "All alerts cleared"})


# =====================================================
# CAMERA FEED RELAY (HYBRID HTTP/WEBSOCKET)
# =====================================================

_latest_frame_bytes = None
_latest_frame_time = 0
CAMERA_FRAME_TIMEOUT = 5

CAMERA_PUSH_TOKEN = os.getenv("CAMERA_PUSH_TOKEN", "change-me")

@robot_bp.route("/camera/frame", methods=["POST"])
def receive_camera_frame():
    """Receives POST from Pi, but emits the frame over WebSockets to dashboards"""
    global _latest_frame_bytes, _latest_frame_time

    token = request.headers.get("X-Camera-Token")
    if token != CAMERA_PUSH_TOKEN:
        return jsonify({"message": "Unauthorized"}), 401

    frame_bytes = request.get_data()
    if not frame_bytes:
        return jsonify({"message": "No frame data received"}), 400

    _latest_frame_bytes = frame_bytes
    _latest_frame_time = time.time()

    # Convert binary frame to base64 and push to WebSockets
    b64_image = base64.b64encode(frame_bytes).decode('utf-8')
    emit('new_camera_frame', {'image': b64_image}, namespace='/', broadcast=True)

    return jsonify({"message": "Frame received and broadcasted"}), 200

# Retained for legacy HTML <img> tags, but WebSocket is preferred
def _mjpeg_relay_generator():
    last_sent_time = 0
    while True:
        if _latest_frame_bytes is not None and _latest_frame_time != last_sent_time:
            last_sent_time = _latest_frame_time
            yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + _latest_frame_bytes + b"\r\n")
        time.sleep(0.05)

@robot_bp.route("/camera/feed", methods=["GET"])
def camera_feed():
    return Response(_mjpeg_relay_generator(), mimetype="multipart/x-mixed-replace; boundary=frame")

@robot_bp.route("/camera/status", methods=["GET"])
def camera_status():
    is_online = (_latest_frame_bytes is not None and (time.time() - _latest_frame_time) < CAMERA_FRAME_TIMEOUT)
    return jsonify({
        "online": is_online,
        "last_frame_seconds_ago": round(time.time() - _latest_frame_time, 1) if _latest_frame_time else None
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

@robot_bp.route("/location/update", methods=["POST"])
def update_location():
    global robot_location
    data = request.get_json()

    if data.get("latitude") is not None:
        robot_location["latitude"] = data.get("latitude")
    if data.get("longitude") is not None:
        robot_location["longitude"] = data.get("longitude")
    if data.get("location"):
        robot_location["location"] = data.get("location")

    emit('location_update', robot_location, namespace='/', broadcast=True)

    return jsonify({"message": "Robot location updated", "location": robot_location})


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

@robot_bp.route("/next-stop/update", methods=["POST"])
def update_next_stop():
    global next_stop
    data = request.get_json()

    if data.get("name"):
        next_stop["name"] = data.get("name")
    if data.get("distance"):
        next_stop["distance"] = data.get("distance")

    emit('next_stop_update', next_stop, namespace='/', broadcast=True)

    return jsonify({"message": "Next stop updated", "next_stop": next_stop})