// =====================================
// ROBODOG PATROL
// =====================================

const API_URL = "https://robodog-web.onrender.com/api/robot";


// =====================================
// PATROL ROUTE
// =====================================

const patrolRoute = [
    {
        name: "Main Gate",
        latitude: 22.5726,
        longitude: 88.3639
    },
    {
        name: "Academic Building",
        latitude: 22.5735,
        longitude: 88.3650
    },
    {
        name: "Library",
        latitude: 22.5745,
        longitude: 88.3660
    },
    {
        name: "Parking Area",
        latitude: 22.5755,
        longitude: 88.3670
    },
    {
        name: "Main Gate",
        latitude: 22.5726,
        longitude: 88.3639
    }
];

let currentIndex = 0;
let patrolMap = null;
let robotMarker = null;


// =====================================
// HTML ELEMENTS
// =====================================

const patrolStatus = document.getElementById("patrolStatus");
const patrolProgress = document.getElementById("patrolProgress");

const patrolRouteElement =
    document.getElementById("patrolRoute");

const currentStop =
    document.getElementById("currentStop");

const nextStop =
    document.getElementById("nextStop");

const patrolStarted =
    document.getElementById("patrolStarted");

const startPatrolBtn =
    document.getElementById("startPatrolBtn");

const stopPatrolBtn =
    document.getElementById("stopPatrolBtn");

const nextStopBtn =
    document.getElementById("nextStopBtn");


// =====================================
// SHOW PATROL ROUTE
// =====================================

function showPatrolRoute() {

    if (patrolRouteElement) {
        patrolRouteElement.textContent =
            "Campus Main Route";
    }
}


// =====================================
// UPDATE CURRENT / NEXT STOP
// =====================================

function updateStops() {

    const current =
        patrolRoute[currentIndex];

    const nextIndex =
        (currentIndex + 1) % patrolRoute.length;

    const next =
        patrolRoute[nextIndex];


    if (currentStop) {
        currentStop.textContent =
            current.name;
    }

    if (nextStop) {
        nextStop.textContent =
            next.name;
    }


    // Progress

    const progress =
        Math.round(
            (currentIndex /
                (patrolRoute.length - 1)) * 100
        );

    if (patrolProgress) {
        patrolProgress.textContent =
            progress + "%";
    }


    // Update map

    updateRobotLocation(
        current.latitude,
        current.longitude,
        current.name
    );
}


// =====================================
// MAP INITIALIZATION
// =====================================

function initializeMap() {

    const mapElement =
        document.getElementById("map");

    if (!mapElement) {
        return;
    }


    patrolMap = L.map("map").setView(
        [22.5726, 88.3639],
        15
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(patrolMap);


    // Create marker

    robotMarker = L.marker(
        [22.5726, 88.3639]
    ).addTo(patrolMap);


    robotMarker.bindPopup(
        "🐕 RoboDog"
    );
}


// =====================================
// UPDATE ROBOT LOCATION
// =====================================

function updateRobotLocation(
    latitude,
    longitude,
    locationName
) {

    if (!patrolMap || !robotMarker) {
        return;
    }


    robotMarker.setLatLng([
        latitude,
        longitude
    ]);


    patrolMap.setView(
        [latitude, longitude],
        15
    );


    robotMarker.bindPopup(
        "🐕 RoboDog<br>" +
        "📍 " + locationName
    );
}


// =====================================
// GET PATROL STATUS
// =====================================

async function getPatrolStatus() {

    try {

        const response =
            await fetch(
                `${API_URL}/patrol/status`
            );


        const data =
            await response.json();


        if (data.patrol_status === "active") {

            if (patrolStatus) {
                patrolStatus.textContent =
                    "Active";
            }

        } else {

            if (patrolStatus) {
                patrolStatus.textContent =
                    "Inactive";
            }
        }


    } catch (error) {

        console.error(
            "Patrol Status Error:",
            error
        );
    }
}


// =====================================
// START PATROL
// =====================================

async function startPatrol() {

    try {

        const response =
            await fetch(
                `${API_URL}/patrol/start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Patrol Started:",
            data
        );


        if (response.ok) {

            if (patrolStatus) {
                patrolStatus.textContent =
                    "Active";
            }


            if (patrolStarted) {

                const now =
                    new Date();

                patrolStarted.textContent =
                    now.toLocaleTimeString();
            }


            currentIndex = 0;

            updateStops();

        }

    } catch (error) {

        console.error(
            "Start Patrol Error:",
            error
        );
    }
}


// =====================================
// STOP PATROL
// =====================================

async function stopPatrol() {

    try {

        const response =
            await fetch(
                `${API_URL}/patrol/stop`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Patrol Stopped:",
            data
        );


        if (response.ok) {

            if (patrolStatus) {
                patrolStatus.textContent =
                    "Inactive";
            }

            if (patrolStarted) {
                patrolStarted.textContent =
                    "Stopped";
            }
        }

    } catch (error) {

        console.error(
            "Stop Patrol Error:",
            error
        );
    }
}


// =====================================
// NEXT STOP
// =====================================

async function goToNextStop() {

    if (currentIndex <
        patrolRoute.length - 1) {

        currentIndex++;

    } else {

        currentIndex = 0;
    }


    updateStops();


    const current =
        patrolRoute[currentIndex];

    const nextIndex =
        (currentIndex + 1) %
        patrolRoute.length;

    const next =
        patrolRoute[nextIndex];


    // Send location to backend

    try {

        await fetch(
            `${API_URL}/location/update`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    latitude:
                        current.latitude,

                    longitude:
                        current.longitude,

                    location:
                        current.name
                })
            }
        );


        // Send next stop

        await fetch(
            `${API_URL}/next-stop/update`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    name: next.name,
                    distance: "500 m"
                })
            }
        );


    } catch (error) {

        console.error(
            "Location Update Error:",
            error
        );
    }
}


// =====================================
// BUTTON EVENTS
// =====================================

if (startPatrolBtn) {

    startPatrolBtn.addEventListener(
        "click",
        startPatrol
    );
}


if (stopPatrolBtn) {

    stopPatrolBtn.addEventListener(
        "click",
        stopPatrol
    );
}


if (nextStopBtn) {

    nextStopBtn.addEventListener(
        "click",
        goToNextStop
    );
}


// =====================================
// INITIAL LOAD
// =====================================

showPatrolRoute();

initializeMap();

updateStops();

getPatrolStatus();


// =====================================
// AUTOMATIC STATUS UPDATE
// =====================================

setInterval(
    getPatrolStatus,
    1000
);