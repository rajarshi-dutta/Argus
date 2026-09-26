// =====================================
// LOGGED-IN USER
// =====================================

const savedUser = localStorage.getItem("user");

if (savedUser) {

    const user = JSON.parse(savedUser);

    const welcomeUser = document.getElementById("welcomeUser");
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");

    if (welcomeUser) {
        welcomeUser.textContent = "Welcome, " + user.name;
    }

    if (userName) {
        userName.textContent = user.name;
    }

    if (userEmail) {
        userEmail.textContent = user.email;
    }

} else {

    window.location.href = "login.html";
}


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
// SHOW COMMAND MESSAGE
// =====================================

function showControlMessage(command) {

    const message = document.getElementById("controlMessage");

    if (!message) {
        return;
    }

    message.textContent = getCommandMessage(command);
}


// =====================================
// UPDATE DASHBOARD ROBOT STATE
// =====================================

function updateDashboardRobotState(data) {

    const command = data.command || "stop";

    // Command message
    showControlMessage(command);


    // Current command
    const currentCommand =
        document.getElementById("currentCommand");

    if (currentCommand) {
        currentCommand.textContent = command;
    }


    // Connection
    const robotConnection =
        document.getElementById("robotConnection");

    if (robotConnection) {
        robotConnection.textContent =
            data.status || "Offline";
    }


    // Header robot status
    const robotStatus =
        document.getElementById("robotStatus");

    if (robotStatus) {

        if (data.status === "online") {
            robotStatus.textContent = "● Online";
        } else {
            robotStatus.textContent = "● Offline";
        }
    }


    // Battery
    const batteryLevel =
        document.getElementById("batteryLevel");

    if (batteryLevel) {
        batteryLevel.textContent =
            (data.battery ?? 0) + "%";
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

        console.log("Command sent:", data);


        if (!response.ok) {

            showControlMessage("stop");

            const message =
                document.getElementById("controlMessage");

            if (message) {
                message.textContent =
                    "❌ Command failed.";
            }

            return;
        }


        // Read shared state again
        await getRobotStatus();

    } catch (error) {

        console.error(
            "Robot Command Error:",
            error
        );

        const message =
            document.getElementById("controlMessage");

        if (message) {
            message.textContent =
                "❌ Cannot connect to robot backend.";
        }
    }
}


// =====================================
// ROBOT STATUS
// =====================================

async function getRobotStatus() {

    try {

        const response = await fetch(
            `${API_URL}/status`
        );

        const data = await response.json();

        console.log(
            "Shared Robot State:",
            data
        );


        if (!response.ok) {
            throw new Error(
                "Robot status request failed"
            );
        }


        updateDashboardRobotState(data);

    } catch (error) {

        console.error(
            "Robot Status Error:",
            error
        );


        const robotConnection =
            document.getElementById("robotConnection");

        if (robotConnection) {
            robotConnection.textContent = "Offline";
        }


        const robotStatus =
            document.getElementById("robotStatus");

        if (robotStatus) {
            robotStatus.textContent = "● Offline";
        }


        const currentCommand =
            document.getElementById("currentCommand");

        if (currentCommand) {
            currentCommand.textContent = "Unknown";
        }


        const batteryLevel =
            document.getElementById("batteryLevel");

        if (batteryLevel) {
            batteryLevel.textContent = "Unknown";
        }
    }
}


// =====================================
// ROBOT CONTROL BUTTONS
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


if (forwardBtn) {

    forwardBtn.addEventListener(
        "click",
        function () {
            sendRobotCommand("forward");
        }
    );
}


if (backwardBtn) {

    backwardBtn.addEventListener(
        "click",
        function () {
            sendRobotCommand("backward");
        }
    );
}


if (leftBtn) {

    leftBtn.addEventListener(
        "click",
        function () {
            sendRobotCommand("left");
        }
    );
}


if (rightBtn) {

    rightBtn.addEventListener(
        "click",
        function () {
            sendRobotCommand("right");
        }
    );
}


if (stopBtn) {

    stopBtn.addEventListener(
        "click",
        function () {
            sendRobotCommand("stop");
        }
    );
}


// =====================================
// FIRST ROBOT STATUS LOAD
// =====================================

getRobotStatus();


// =====================================
// AUTOMATIC ROBOT STATUS SYNC
// =====================================

setInterval(
    getRobotStatus,
    1000
);


// =====================================
// INTRUDER STATUS
// =====================================

async function getIntruderStatus() {

    try {

        const response = await fetch(
            `${API_URL}/intruder/status`
        );

        const data = await response.json();

        if (response.ok) {

            const status =
                document.getElementById("intruderStatus");

            const count =
                document.getElementById("intruderCount");

            const suspicion =
                document.getElementById("suspicionRate");


            if (status) {
                status.textContent = data.status;
            }

            if (count) {
                count.textContent = data.count;
            }

            if (suspicion) {
                suspicion.textContent =
                    data.suspicion_rate + "%";
            }
        }

    } catch (error) {

        console.error(
            "Intruder Status Error:",
            error
        );
    }
}

getIntruderStatus();


// =====================================
// INTRUDER TEST
// =====================================

const testIntruderBtn =
    document.getElementById("testIntruderBtn");

const resetIntruderBtn =
    document.getElementById("resetIntruderBtn");


if (testIntruderBtn) {

    testIntruderBtn.addEventListener(
        "click",
        async function () {

            try {

                const response = await fetch(
                    `${API_URL}/intruder/test`,
                    {
                        method: "POST"
                    }
                );

                const data =
                    await response.json();


                if (response.ok) {

                    document.getElementById(
                        "intruderStatus"
                    ).textContent = data.status;

                    document.getElementById(
                        "intruderCount"
                    ).textContent = data.count;

                    document.getElementById(
                        "suspicionRate"
                    ).textContent =
                        data.suspicion_rate + "%";
                }

            } catch (error) {

                console.error(
                    "Intruder Test Error:",
                    error
                );
            }
        }
    );
}


if (resetIntruderBtn) {

    resetIntruderBtn.addEventListener(
        "click",
        async function () {

            try {

                const response = await fetch(
                    `${API_URL}/intruder/reset`,
                    {
                        method: "POST"
                    }
                );

                const data =
                    await response.json();


                if (response.ok) {

                    document.getElementById(
                        "intruderStatus"
                    ).textContent = data.status;

                    document.getElementById(
                        "intruderCount"
                    ).textContent = data.count;

                    document.getElementById(
                        "suspicionRate"
                    ).textContent =
                        data.suspicion_rate + "%";
                }

            } catch (error) {

                console.error(
                    "Intruder Reset Error:",
                    error
                );
            }
        }
    );
}


// =====================================
// DISASTER STATUS
// =====================================

async function getDisasterStatus() {

    try {

        const response = await fetch(
            `${API_URL}/disaster/status`
        );

        const data =
            await response.json();


        if (response.ok) {

            const status =
                document.getElementById(
                    "disasterDetectionStatus"
                );

            const type =
                document.getElementById(
                    "disasterType"
                );

            const confidence =
                document.getElementById(
                    "disasterConfidence"
                );


            if (status) {
                status.textContent = data.status;
            }

            if (type) {
                type.textContent =
                    data.type || "None";
            }

            if (confidence) {
                confidence.textContent =
                    data.confidence + "%";
            }
        }

    } catch (error) {

        console.error(
            "Disaster Status Error:",
            error
        );
    }
}

getDisasterStatus();


// =====================================
// DISASTER TEST
// =====================================

const testDisasterBtn =
    document.getElementById(
        "testDisasterBtn"
    );

const resetDisasterBtn =
    document.getElementById(
        "resetDisasterBtn"
    );


if (testDisasterBtn) {

    testDisasterBtn.addEventListener(
        "click",
        async function () {

            try {

                const response = await fetch(
                    `${API_URL}/disaster/test`,
                    {
                        method: "POST"
                    }
                );

                const data =
                    await response.json();


                if (response.ok) {

                    document.getElementById(
                        "disasterDetectionStatus"
                    ).textContent =
                        data.status;

                    document.getElementById(
                        "disasterType"
                    ).textContent =
                        data.type;

                    document.getElementById(
                        "disasterConfidence"
                    ).textContent =
                        data.confidence + "%";

                    document.getElementById(
                        "disasterStatus"
                    ).textContent =
                        data.status;

                    console.log(
                        "Disaster:",
                        data
                    );
                }

            } catch (error) {

                console.error(
                    "Disaster Test Error:",
                    error
                );
            }
        }
    );
}


if (resetDisasterBtn) {

    resetDisasterBtn.addEventListener(
        "click",
        async function () {

            try {

                const response = await fetch(
                    `${API_URL}/disaster/reset`,
                    {
                        method: "POST"
                    }
                );

                const data =
                    await response.json();


                if (response.ok) {

                    document.getElementById(
                        "disasterDetectionStatus"
                    ).textContent =
                        data.status;

                    document.getElementById(
                        "disasterType"
                    ).textContent =
                        data.type || "None";

                    document.getElementById(
                        "disasterConfidence"
                    ).textContent =
                        data.confidence + "%";

                    document.getElementById(
                        "disasterStatus"
                    ).textContent =
                        data.status;
                }

            } catch (error) {

                console.error(
                    "Disaster Reset Error:",
                    error
                );
            }
        }
    );
}


// =====================================
// ALERT COUNT
// =====================================

async function getAlertCount() {

    try {

        const response = await fetch(
            `${API_URL}/alerts/count`
        );

        const data =
            await response.json();


        if (response.ok) {

            const alertCount =
                document.getElementById(
                    "alertCount"
                );

            if (alertCount) {
                alertCount.textContent =
                    data.count;
            }
        }

    } catch (error) {

        console.error(
            "Alert Count Error:",
            error
        );
    }
}

getAlertCount();


// =====================================
// PATROL INFORMATION
// =====================================

const patrolRoute = [
    "Main Gate",
    "Parking Area",
    "Building A",
    "Building B"
];

let currentPatrolIndex = 0;


// Show patrol route
function showPatrolRoute() {

    const patrolRouteElement =
        document.getElementById(
            "patrolRoute"
        );

    if (patrolRouteElement) {

        patrolRouteElement.textContent =
            patrolRoute.join(" → ");
    }
}

showPatrolRoute();


// =====================================
// PATROL STATUS
// =====================================

async function getPatrolStatus() {

    try {

        const response = await fetch(
            `${API_URL}/patrol/status`
        );

        const data =
            await response.json();


        if (response.ok) {

            const patrolStatus =
                document.getElementById(
                    "patrolStatus"
                );

            if (patrolStatus) {

                patrolStatus.textContent =
                    data.patrol_status;
            }
        }

    } catch (error) {

        console.error(
            "Patrol Status Error:",
            error
        );
    }
}

getPatrolStatus();


// =====================================
// PATROL START
// =====================================

const startPatrolBtn =
    document.getElementById(
        "startPatrolBtn"
    );

const stopPatrolBtn =
    document.getElementById(
        "stopPatrolBtn"
    );


if (startPatrolBtn) {

    startPatrolBtn.addEventListener(
        "click",
        async function () {

            try {

                const response = await fetch(
                    `${API_URL}/patrol/start`,
                    {
                        method: "POST"
                    }
                );

                const data =
                    await response.json();


                if (response.ok) {

                    const patrolStatus =
                        document.getElementById(
                            "patrolStatus"
                        );

                    if (patrolStatus) {
                        patrolStatus.textContent =
                            data.patrol_status;
                    }

                    showControlMessage("patrol");

                    console.log(
                        "Patrol started:",
                        data
                    );
                }

            } catch (error) {

                console.error(
                    "Patrol Start Error:",
                    error
                );
            }
        }
    );
}


// =====================================
// PATROL STOP
// =====================================

if (stopPatrolBtn) {

    stopPatrolBtn.addEventListener(
        "click",
        async function () {

            try {

                const response = await fetch(
                    `${API_URL}/patrol/stop`,
                    {
                        method: "POST"
                    }
                );

                const data =
                    await response.json();


                if (response.ok) {

                    const patrolStatus =
                        document.getElementById(
                            "patrolStatus"
                        );

                    if (patrolStatus) {
                        patrolStatus.textContent =
                            data.patrol_status;
                    }

                    showControlMessage("stop");

                    console.log(
                        "Patrol stopped:",
                        data
                    );
                }

            } catch (error) {

                console.error(
                    "Patrol Stop Error:",
                    error
                );
            }
        }
    );
}


// =====================================
// PATROL LOCATION
// =====================================

async function getPatrolLocation() {

    try {

        const locationResponse =
            await fetch(
                `${API_URL}/location`
            );

        const locationData =
            await locationResponse.json();


        if (locationResponse.ok) {

            const currentStop =
                document.getElementById(
                    "currentStop"
                );

            if (currentStop) {

                currentStop.textContent =
                    locationData.location;
            }
        }


        const nextResponse =
            await fetch(
                `${API_URL}/next-stop`
            );

        const nextData =
            await nextResponse.json();


        if (nextResponse.ok) {

            const nextStop =
                document.getElementById(
                    "nextStop"
                );

            if (nextStop) {

                nextStop.textContent =
                    nextData.name +
                    " (" +
                    nextData.distance +
                    ")";
            }
        }

    } catch (error) {

        console.error(
            "Patrol Location Error:",
            error
        );
    }
}

getPatrolLocation();


// =====================================
// NEXT STOP
// =====================================

const nextStopBtn =
    document.getElementById(
        "nextStopBtn"
    );


if (nextStopBtn) {

    nextStopBtn.addEventListener(
        "click",
        async function () {

            currentPatrolIndex++;

            if (
                currentPatrolIndex >=
                patrolRoute.length
            ) {
                currentPatrolIndex = 0;
            }


            const currentStop =
                document.getElementById(
                    "currentStop"
                );

            if (currentStop) {

                currentStop.textContent =
                    patrolRoute[
                        currentPatrolIndex
                    ];
            }


            const progress =
                document.getElementById(
                    "patrolProgress"
                );

            if (progress) {

                const percentage =
                    Math.round(
                        (
                            currentPatrolIndex /
                            (patrolRoute.length - 1)
                        ) * 100
                    );

                progress.textContent =
                    percentage + "%";
            }


            updateRobotLocation(
                patrolRoute[
                    currentPatrolIndex
                ]
            );


            console.log(
                "Patrol moved to:",
                patrolRoute[
                    currentPatrolIndex
                ]
            );
        }
    );
}


// =====================================
// MAP
// =====================================

let map = null;
let robotMarker = null;


if (typeof L !== "undefined") {

    map = L.map("map")
        .setView(
            [22.5726, 88.3639],
            16
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    // Patrol locations

    const mainGate =
        [22.5726, 88.3639];

    const parkingArea =
        [22.5732, 88.3650];

    const buildingA =
        [22.5740, 88.3642];

    const buildingB =
        [22.5745, 88.3628];


    // Markers

    L.marker(mainGate)
        .addTo(map)
        .bindPopup("🏁 Main Gate");


    L.marker(parkingArea)
        .addTo(map)
        .bindPopup("🅿️ Parking Area");


    L.marker(buildingA)
        .addTo(map)
        .bindPopup("🏢 Building A");


    L.marker(buildingB)
        .addTo(map)
        .bindPopup("🏢 Building B");


    // Route

    const route = [
        mainGate,
        parkingArea,
        buildingA,
        buildingB,
        mainGate
    ];


    L.polyline(route)
        .addTo(map);


    // RoboDog marker

    robotMarker =
        L.marker(mainGate)
            .addTo(map)
            .bindPopup("🐕 RoboDog")
            .openPopup();
}


// =====================================
// UPDATE ROBODOG MAP LOCATION
// =====================================

function updateRobotLocation(stop) {

    if (!robotMarker || !map) {
        return;
    }


    const locations = {

        "Main Gate":
            [22.5726, 88.3639],

        "Parking Area":
            [22.5732, 88.3650],

        "Building A":
            [22.5740, 88.3642],

        "Building B":
            [22.5745, 88.3628]
    };


    if (locations[stop]) {

        robotMarker.setLatLng(
            locations[stop]
        );

        map.panTo(
            locations[stop]
        );
    }
}


// =====================================
// ALERT HISTORY
// =====================================

async function getAlertHistory() {

    try {

        const response =
            await fetch(
                `${API_URL}/alerts`
            );

        const data =
            await response.json();


        const alertHistory =
            document.getElementById(
                "alertHistory"
            );


        if (!alertHistory) {
            return;
        }


        if (response.ok) {

            if (data.length === 0) {

                alertHistory.innerHTML =
                    "<p>No alerts yet.</p>";

                return;
            }


            alertHistory.innerHTML = "";


            data.forEach(function (alert) {

                const alertItem =
                    document.createElement("div");


                alertItem.innerHTML = `
                    <p>
                        🚨 <strong>${alert.type}</strong>
                        - ${alert.message}
                    </p>
                `;


                alertHistory.appendChild(
                    alertItem
                );
            });
        }

    } catch (error) {

        console.error(
            "Alert History Error:",
            error
        );


        const alertHistory =
            document.getElementById(
                "alertHistory"
            );


        if (alertHistory) {

            alertHistory.innerHTML =
                "<p>Unable to load alert history.</p>";
        }
    }
}

getAlertHistory();


// =====================================
// LOGOUT
// =====================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";
        }
    );
}


// =====================================
// CAMERA FEED
// =====================================

async function checkCameraStatus() {

    try {

        const response = await fetch(`${API_URL}/camera/status`);
        const data = await response.json();

        const feedImg = document.getElementById("cameraFeed");
        const statusText = document.getElementById("cameraStatus");

        if (data.online) {

            if (statusText) {
                statusText.textContent = "🟢 Camera Online";
            }

            // Only (re)set the src if it's not already streaming, to
            // avoid restarting the MJPEG connection every poll.
            if (feedImg && !feedImg.src) {
                feedImg.src = `${API_URL}/camera/feed`;
            }

        } else {

            if (statusText) {
                statusText.textContent = "🔴 Camera Offline";
            }

            if (feedImg) {
                feedImg.src = "";
            }
        }

    } catch (error) {

        console.error("Camera Status Error:", error);

        const statusText = document.getElementById("cameraStatus");
        if (statusText) {
            statusText.textContent = "🔴 Camera Offline";
        }
    }
}

checkCameraStatus();
setInterval(checkCameraStatus, 5000);