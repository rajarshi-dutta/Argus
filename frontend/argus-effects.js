/* ==========================================================================
   ARGUS TACTICAL COMMAND CENTER — INTERACTIVE EFFECTS ENGINE
   ========================================================================== */

(function () {
    // 1. Tactical Synthesizer Sound FX (Native Web Audio API)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function playBeep(freq = 880, type = "sine", duration = 0.06, gainVol = 0.05) {
        try {
            if (!audioCtx) audioCtx = new AudioContext();
            if (audioCtx.state === "suspended") audioCtx.resume();

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(gainVol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Audio context not allowed until first interaction
        }
    }

    // Attach sound effects to HUD buttons & navigation
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("button, .nav-link").forEach(btn => {
            btn.addEventListener("mouseenter", () => playBeep(1200, "sine", 0.03, 0.02));
            btn.addEventListener("click", () => {
                if (btn.classList.contains("stop")) {
                    playBeep(320, "sawtooth", 0.18, 0.08); // Heavy alarm tone on STOP
                } else {
                    playBeep(980, "triangle", 0.08, 0.04);
                }
            });
        });

        // 2. Simulated Telemetry Clock / Pinger
        const statusEl = document.getElementById("robotConnection");
        if (statusEl) {
            setInterval(() => {
                const latency = Math.floor(Math.random() * 8) + 12; // 12-20ms
                statusEl.innerHTML = `🟢 ONLINE &bull; ${latency}ms`;
            }, 3000);
        }
    });
})();