console.log('game.js cargado');

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") || "classic";
console.log("Modo seleccionado:", mode);

const audio = new Audio('./audio.mp3');
audio.preload = 'auto';
audio.volume = 0.8;

const GAME_DURATION = 85;      
const STOP_TIME = 80;          

let audioStarted = false;
function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  audio.currentTime = 0;
  audio.play();
}

let waitingStart = true;

const startMsg = document.createElement("div");
startMsg.className = "start-message";
startMsg.textContent = "Pulsa ENTER para empezar y ESC para pausar";
document.body.appendChild(startMsg);

let paused = false;

function pauseGame() {
  paused = true;
  audio.pause();
  document.getElementById("pauseMenu").style.display = "flex";
}

function resumeGame() {
  paused = false;
  audio.play();
  document.getElementById("pauseMenu").style.display = "none";
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && audioStarted && !waitingStart) {
    if (!paused) pauseGame();
    else resumeGame();
  }
});

const lanes = {
  a: document.querySelector('.lane.yellow'),
  s: document.querySelector('.lane.green'),
  d: document.querySelector('.lane.blue'),
  f: document.querySelector('.lane.red')
};

const scoreElement = document.querySelector('.score');
let score = 0;

const NOTE_SPEED = 3;
const HIT_WINDOW = 40;
const HIT_OFFSET = 80;
const NOTE_START_OFFSET = 20;

let FALL_TIME = 800;

const feedback = document.createElement('div');
feedback.className = 'feedback';
document.body.appendChild(feedback);

function showFeedback(text, success) {
  feedback.textContent = text;
  feedback.style.color = success ? '#00ffcc' : '#ff3366';
  feedback.style.opacity = 1;
  setTimeout(() => feedback.style.opacity = 0, 500);
}

const timelineContainer = document.createElement('div');
const timelineBar = document.createElement('div');
timelineContainer.className = 'timeline';
timelineBar.className = 'timeline-bar';
timelineContainer.appendChild(timelineBar);
document.body.appendChild(timelineContainer);

function createNote(key, duration = 0) {
  const note = document.createElement('div');
  note.classList.add('note');
  note.style.top = `-${NOTE_START_OFFSET}px`;
  note.dataset.key = key;

  if (duration > 0) note.dataset.hold = 'true';

  lanes[key].appendChild(note);
  return note;
}


let chart = [];

function addPattern(start, interval, keys, repeats, duration = 180) {
  let time = start;
  for (let i = 0; i < repeats; i++) {
    chart.push({
      time,
      key: keys[i % keys.length],
      duration
    });
    time += interval;
  }
  return time;
}

let t = 2000;
t = addPattern(t, 600, ['a','s'], 10);
t = addPattern(t, 400, ['a','s','d','f'], 40);
t = addPattern(t, 300, ['a','d','s','f'], 60);
t = addPattern(t, 220, ['a','s','d','f','d','s'], 90);
addPattern(t, 180, ['a','f','s','d','a','d','s','f'], 120);

let chartIndex = 0;

document.addEventListener("keydown", e => {
  if (waitingStart && e.key === "Enter") {
    waitingStart = false;
    startMsg.style.opacity = 0;
    setTimeout(() => startMsg.remove(), 300);
    startAudio();
  }
});


function endGame() {
  localStorage.setItem("lastScore", score);
  localStorage.setItem("lastMode", mode);
  window.location.href = "gameover.html";
}

function gameLoop() {

  if (paused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  if (!audioStarted) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const elapsed = audio.currentTime * 1000;
  const time = audio.currentTime;

  const canPlay = time < STOP_TIME;


  if (canPlay) {
    while (
      chartIndex < chart.length &&
      elapsed >= chart[chartIndex].time - FALL_TIME
    ) {
      createNote(chart[chartIndex].key, chart[chartIndex].duration);
      chartIndex++;
    }
  }

  document.querySelectorAll('.note').forEach(note => {
    let top = parseFloat(note.style.top);
    note.style.top = top + NOTE_SPEED + 'px';

    const laneHeight = note.parentElement.offsetHeight;
    if (top > laneHeight) {
      note.remove();
      if (canPlay) {
        showFeedback('FALLO', false);
        if (mode === "sudden") endGame();
      }
    }
  });

  timelineBar.style.height = Math.min(
    (time / GAME_DURATION) * 100,
    100
  ) + '%';

  if (time >= GAME_DURATION) {
    endGame();
    return;
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if (!lanes[key] || waitingStart || paused) return;

  if (audio.currentTime >= STOP_TIME) return;

  const notes = lanes[key].querySelectorAll('.note');
  const laneHeight = lanes[key].offsetHeight;
  const hitZone = laneHeight - HIT_OFFSET;

  for (let note of notes) {
    const top = parseFloat(note.style.top);
    if (Math.abs(top - hitZone) < HIT_WINDOW) {
      score += 100;
      scoreElement.textContent = score;
      note.remove();
      showFeedback('ACIERTO', true);
      return;
    }
  }

  showFeedback('FALLO', false);
  if (mode === "sudden") endGame();
});

function highlightKey(key) {
  const lane = lanes[key];
  if (!lane) return;
  lane.querySelector('.key').classList.add('active');
}

function unhighlightKey(key) {
  const lane = lanes[key];
  if (!lane) return;
  lane.querySelector('.key').classList.remove('active');
}

document.addEventListener('keydown', e => highlightKey(e.key.toLowerCase()));
document.addEventListener('keyup', e => unhighlightKey(e.key.toLowerCase()));

document.getElementById("resumeBtn").addEventListener("click", () => {
  resumeGame();
});

document.getElementById("menuBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});
