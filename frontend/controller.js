// =====================================
// ROBODOG API
// =====================================

const API_BASE = "http://localhost:5050";


// =====================================
// COMMAND MESSAGE
// =====================================

function getCommandMessage(command) {
    if (command === "forward") {
        return "🤖 RoboDog is moving Forward 🚀";
    }
    if (command === "backward") {
        return "🤖 RoboDog is moving Backward 🔄";
    }
    if (command === "left") {
        return "🤖 RoboDog is turning Left ◀️";
    }
    if (command === "right") {
        return "🤖 RoboDog is turning Right ▶️";
    }
    if (command === "stop") {
        return "🛑 RoboDog has stopped.";
    }
    if (command === "patrol") {
        return "🐕 RoboDog is on Patrol.";
    }
    return "🤖 RoboDog is ready for manual commands.";
}


// =====================================
// SHOW MESSAGE
// =====================================

function showControlMessage(command) {
    const controlMessage = document.getElementById("controlMessage");
    if (controlMessage) {
        controlMessage.textContent = getCommandMessage(command);
    }
}


// =====================================
// SEND ROBOT COMMAND
// =====================================

async function sendRobotCommand(command) {
    // Retrieve the secure token saved during login
    const token = localStorage.getItem("token");

    try {
        // Hitting the new /api/control endpoint for WebSocket relay
        const response = await fetch(`${API_BASE}/api/control`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Inject JWT token here
            },
            // The new Flask endpoint expects JSON like { "action": "forward" }
            body: JSON.stringify({ action: command }) 
        });

        const data = await response.json();
        console.log("Robot Response:", data);

        if (response.ok) {
            // Immediately show message on Controller
            showControlMessage(command);

        } else {
            const controlMessage = document.getElementById("controlMessage");
            if (controlMessage) {
                controlMessage.textContent = data.message || "❌ Command failed.";
            }

            // If token is invalid or expired, force a fresh login
            if (response.status === 401) {
                console.warn("Session expired or invalid. Redirecting to login.");
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                window.location.href = "login.html";
            }
        }

    } catch (error) {
        console.error("Robot Command Error:", error);
        const controlMessage = document.getElementById("controlMessage");
        if (controlMessage) {
            controlMessage.textContent = "❌ Cannot connect to server.";
        }
    }
}


// =====================================
// GET CURRENT ROBOT STATUS
// =====================================

async function getRobotStatus() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE}/api/robot/status`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("Current Robot State:", data);

        if (response.ok) {
            // Show command saved by backend
            showControlMessage(data.command);

        } else if (response.status === 401) {
            // Handle unauthorized status on initial load
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            window.location.href = "login.html";
        }

    } catch (error) {
        console.error("Robot Status Error:", error);
    }
}


// =====================================
// CONTROLLER BUTTONS
// =====================================

const forwardBtn = document.getElementById("forwardBtn");
const backwardBtn = document.getElementById("backwardBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const stopBtn = document.getElementById("stopBtn");

// Attach event listeners using arrow functions for clean syntax
if (forwardBtn) {
    forwardBtn.addEventListener("click", () => sendRobotCommand("forward"));
}

if (backwardBtn) {
    backwardBtn.addEventListener("click", () => sendRobotCommand("backward"));
}

if (leftBtn) {
    leftBtn.addEventListener("click", () => sendRobotCommand("left"));
}

if (rightBtn) {
    rightBtn.addEventListener("click", () => sendRobotCommand("right"));
}

if (stopBtn) {
    stopBtn.addEventListener("click", () => sendRobotCommand("stop"));
}


// =====================================
// KEYBOARD CONTROLS (WASD / Arrow Keys)
// =====================================

window.addEventListener("keydown", (event) => {
    // Prevent default window scrolling when using arrow keys or spacebar
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d"].includes(event.key)) {
        event.preventDefault();
    }

    switch (event.key.toLowerCase()) {
        case "arrowup":
        case "w":
            sendRobotCommand("forward");
            break;
            
        case "arrowdown":
        case "s":
            sendRobotCommand("backward");
            break;
            
        case "arrowleft":
        case "a":
            sendRobotCommand("left");
            break;
            
        case "arrowright":
        case "d":
            sendRobotCommand("right");
            break;
            
        case " ": // Spacebar for emergency stop
        case "x":
            sendRobotCommand("stop");
            break;
    }
});


// =====================================
// FIRST STATUS LOAD
// =====================================

getRobotStatus();