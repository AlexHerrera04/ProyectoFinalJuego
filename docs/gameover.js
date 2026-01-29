console.log("gameover.js cargado");

const finalScore = localStorage.getItem("lastScore") || 0;
const lastMode = localStorage.getItem("lastMode") || "classic";

document.getElementById("final-score").textContent = finalScore;

document.querySelector(".retry-btn")?.addEventListener("click", () => {
    window.location.href = `game.html?mode=${lastMode}`;
});

document.querySelector(".menu-btn")?.addEventListener("click", () => {
    window.location.href = "index.html";
});
