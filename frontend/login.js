const API_BASE = "http://localhost:5050";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            `${API_BASE}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            // Save user info and JWT token
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token); // <-- ADD THIS LINE

            message.textContent = "Login successful!";
            window.location.href = "dashboard.html";

        } else {

            message.textContent = data.message;

        }

    } catch (error) {

        console.error("Login Error:", error);

        message.textContent =
            "Cannot connect to server.";

    }

});