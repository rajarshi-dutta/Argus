// =====================================
// ROBODOG API
// =====================================

const API_URL = "https://robodog-web.onrender.com/api/robot";


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

    try {

        const response = await fetch(
            `${API_URL}/${command}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
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
                    "❌ Command failed.";
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

    try {

        const response = await fetch(
            `${API_URL}/status`
        );

        const data = await response.json();

        console.log("Current Robot State:", data);

        if (response.ok) {

            // IMPORTANT:
            // Read command saved by Dashboard
            // OR Controller

            showControlMessage(data.command);

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


// =====================================
// AUTOMATIC SYNC
// =====================================

// Every 1 second Controller
// checks the shared robot command

setInterval(
    getRobotStatus,
    1000
);