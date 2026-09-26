const API_BASE = "https://robodog-web.onrender.com";

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const message = document.getElementById("message");

    try {

        const response = await fetch(
            `${API_BASE}/api/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            message.textContent = data.message;

            registerForm.reset();

        } else {

            message.textContent = data.message;
        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Cannot connect to backend server.";

    }

});