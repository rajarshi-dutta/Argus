const API_BASE = "https://robodog-web.onrender.com";

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const otpSection =
    document.getElementById("otpSection");

const passwordSection =
    document.getElementById("passwordSection");

const verifyOtpBtn =
    document.getElementById("verifyOtpBtn");

const resetPasswordBtn =
    document.getElementById("resetPasswordBtn");

const message =
    document.getElementById("message");


// =====================================
// OTP TIMER
// =====================================

let otpTimer;

let otpTime = 300; // 5 minutes


function startOtpTimer() {

    clearInterval(otpTimer);

    otpTime = 300;

    let timerElement =
        document.getElementById("otpTimer");

    timerElement.style.display = "block";

    verifyOtpBtn.disabled = false;

    updateTimer();


    otpTimer = setInterval(function () {

        otpTime--;

        updateTimer();


        if (otpTime <= 0) {

            clearInterval(otpTimer);

            timerElement.textContent =
                "OTP expired. Please request a new OTP.";

            timerElement.style.color = "#dc2626";

            verifyOtpBtn.disabled = true;

            message.textContent =
                "OTP has expired. Please request a new OTP.";

            message.style.color = "#dc2626";
        }

    }, 1000);
}



function updateTimer() {

    const timerElement =
        document.getElementById("otpTimer");

    let minutes =
        Math.floor(otpTime / 60);

    let seconds =
        otpTime % 60;


    minutes =
        minutes.toString().padStart(2, "0");

    seconds =
        seconds.toString().padStart(2, "0");


    timerElement.textContent =
        `OTP expires in: ${minutes}:${seconds}`;

    timerElement.style.color = "#2563eb";
}



// =====================================
// SEND OTP
// =====================================

forgotPasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();


        try {

            const response = await fetch(
                `${API_BASE}/api/auth/forgot-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email
                    })
                }
            );


            const data =
                await response.json();


            if (response.ok) {

                message.textContent =
                    "OTP sent successfully to your email.";

                message.style.color =
                    "#16a34a";


                // Show OTP section

                otpSection.style.display =
                    "block";


                // Start 5 minute timer

                startOtpTimer();

            } else {

                message.textContent =
                    data.message ||
                    "Something went wrong.";

                message.style.color =
                    "#dc2626";
            }


        } catch (error) {

            console.error(
                "Send OTP Error:",
                error
            );

            message.textContent =
                "Cannot connect to server.";

            message.style.color =
                "#dc2626";
        }

    }
);



// =====================================
// VERIFY OTP
// =====================================

verifyOtpBtn.addEventListener(
    "click",
    async function () {


        // Don't allow verification after timer ends

        if (otpTime <= 0) {

            message.textContent =
                "OTP has expired. Please request a new OTP.";

            message.style.color =
                "#dc2626";

            return;
        }


        const email =
            document.getElementById("email").value.trim();


        const otp =
            document.getElementById("otp").value.trim();


        if (otp.length !== 6) {

            message.textContent =
                "Please enter a valid 6-digit OTP.";

            message.style.color =
                "#dc2626";

            return;
        }


        try {

            const response = await fetch(
                `${API_BASE}/api/auth/verify-otp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        otp: otp
                    })
                }
            );


            const data =
                await response.json();


            if (response.ok) {

                clearInterval(otpTimer);

                message.textContent =
                    "OTP verified successfully!";

                message.style.color =
                    "#16a34a";


                // Hide timer

                document.getElementById(
                    "otpTimer"
                ).style.display = "none";


                // Show password section

                passwordSection.style.display =
                    "block";


            } else {

                message.textContent =
                    data.message ||
                    "Invalid OTP.";

                message.style.color =
                    "#dc2626";
            }


        } catch (error) {

            console.error(
                "Verify OTP Error:",
                error
            );

            message.textContent =
                "Cannot connect to server.";

            message.style.color =
                "#dc2626";
        }

    }
);



// =====================================
// RESET PASSWORD
// =====================================

resetPasswordBtn.addEventListener(
    "click",
    async function () {


        const email =
            document.getElementById("email").value.trim();


        const otp =
            document.getElementById("otp").value.trim();


        const newPassword =
            document.getElementById("newPassword").value;


        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // Check password

        if (!newPassword || !confirmPassword) {

            message.textContent =
                "Please enter both passwords.";

            message.style.color =
                "#dc2626";

            return;
        }


        // Check matching passwords

        if (newPassword !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            message.style.color =
                "#dc2626";

            return;
        }


        // Check password length

        if (newPassword.length < 6) {

            message.textContent =
                "Password must be at least 6 characters.";

            message.style.color =
                "#dc2626";

            return;
        }


        try {

            const response = await fetch(
                `${API_BASE}/api/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        otp: otp,
                        new_password: newPassword
                    })
                }
            );


            const data =
                await response.json();


            if (response.ok) {

                message.textContent =
                    "Password reset successfully!";

                message.style.color =
                    "#16a34a";


                otpSection.style.display =
                    "none";


                passwordSection.style.display =
                    "none";


                clearInterval(otpTimer);


                setTimeout(function () {

                    window.location.href =
                        "login.html";

                }, 2000);


            } else {

                message.textContent =
                    data.message ||
                    "Password reset failed.";

                message.style.color =
                    "#dc2626";
            }


        } catch (error) {

            console.error(
                "Reset Password Error:",
                error
            );

            message.textContent =
                "Cannot connect to server.";

            message.style.color =
                "#dc2626";
        }

    }
);