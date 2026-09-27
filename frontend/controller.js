// =====================================
// ROBODOG API
// =====================================

const API_URL = "http://localhost:5050/api/robot";


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

    return "🤖 RoboDog is ready.";
}


// =====================================
// SHOW MESSAGE
// =====================================

function showControlMessage(command) {

    const controlMessage =
        document.getElementById("controlMessage");

    if (controlMessage) {
        controlMessage.textContent =
            getCommandMessage(command);
    }
}


// =====================================
// SEND ROBOT COMMAND
// =====================================

async function sendRobotCommand(command) {

    // Retrieve the secure token saved during login
    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/${command}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Inject JWT token here
                }
            }
        );

        const data = await response.json();

        console.log("Robot Response:", data);

        if (response.ok) {

            // Immediately show message on Controller
            showControlMessage(data.command);

        } else {

            const controlMessage =
                document.getElementById("controlMessage");

            if (controlMessage) {
                controlMessage.textContent =
                    data.message || "❌ Command failed.";
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

        const controlMessage =
            document.getElementById("controlMessage");

        if (controlMessage) {
            controlMessage.textContent =
                "❌ Cannot connect to server.";
        }
    }
}


// =====================================
// GET CURRENT ROBOT STATUS
// =====================================

async function getRobotStatus() {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/status`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

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

        console.error(
            "Robot Status Error:",
            error
        );
    }
}


// =====================================
// CONTROLLER BUTTONS
// =====================================

const forwardBtn =
    document.getElementById("forwardBtn");

const backwardBtn =
    document.getElementById("backwardBtn");

const leftBtn =
    document.getElementById("leftBtn");

const rightBtn =
    document.getElementById("rightBtn");

const stopBtn =
    document.getElementById("stopBtn");


// =====================================
// FORWARD
// =====================================

if (forwardBtn) {

    forwardBtn.addEventListener(
        "click",
        function () {

            sendRobotCommand("forward");

        }
    );
}


// =====================================
// BACKWARD
// =====================================

if (backwardBtn) {

    backwardBtn.addEventListener(
        "click",
        function () {

            sendRobotCommand("backward");

        }
    );
}


// =====================================
// LEFT
// =====================================

if (leftBtn) {

    leftBtn.addEventListener(
        "click",
        function () {

            sendRobotCommand("left");

        }
    );
}


// =====================================
// RIGHT
// =====================================

if (rightBtn) {

    rightBtn.addEventListener(
        "click",
        function () {

            sendRobotCommand("right");

        }
    );
}


// =====================================
// STOP
// =====================================

if (stopBtn) {

    stopBtn.addEventListener(
        "click",
        function () {

            sendRobotCommand("stop");

        }
    );
}


// =====================================
// FIRST STATUS LOAD
// =====================================

getRobotStatus();