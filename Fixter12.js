// =====================
// Fixter.js
// =====================

// Przechowujemy referencje do elementów paska odtwarzacza
const globalAudio = document.getElementById("global-audio");   // <audio id="global-audio">
const spotifyBar = document.getElementById("spotify-bar");     // <div id="spotify-bar">
const barTitle = document.getElementById("bar-track-title");   // <span id="bar-track-title">
const barArt = document.getElementById("bar-art");             // <img id="bar-art">
const barPlayBtn = document.getElementById("bar-play-btn");    // <button id="bar-play-btn">
const barCloseBtn = document.querySelector(".bar-close");      // <button class="bar-close">

// Referencje do progresu
const progressFilled = document.querySelector(".progress-filled");
const progressHandle = document.querySelector(".progress-handle");
const progressBar = document.querySelector(".progress-bar");

let isDragging = false;

// =====================
// Funkcja uruchamiana przy kliknięciu w dowolny .track-item
// =====================
window.playTrack = function (event, el) {
  event.stopPropagation();

  const trackItem = el.classList.contains("track-item") ? el : el.closest(".track-item");
  if (!trackItem) return;

  const audioSrc = trackItem.getAttribute("data-audio");
  if (!audioSrc) return;

  const trackTitleElem = trackItem.querySelector(".track-title");
  let titleText = "Nieznany utwór";
  if (trackTitleElem) {
    for (const node of trackTitleElem.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        titleText = node.textContent.trim();
        break;
      }
    }
  }

  const albumCoverElem = trackItem.closest(".album-details")?.querySelector(".cover");
  const coverURL = albumCoverElem ? albumCoverElem.src : "";

  // Jeśli klikamy nowy utwór
  if (globalAudio.src !== audioSrc) {
    globalAudio.src = audioSrc;
    globalAudio.currentTime = 0;
    barTitle.textContent = titleText;
    barArt.src = coverURL;
    updateProgress(0);
    if (typeof durationElem !== "undefined") durationElem.textContent = "0:00";
    if (typeof currentTimeElem !== "undefined") currentTimeElem.textContent = "0:00";
  }

  // Pokaż pasek tylko przy kliknięciu
  spotifyBar.style.display = "flex";

  // Odtwórz audio i zaktualizuj ikonę
  globalAudio.play();
  if (barPlayIcon) {
    barPlayIcon.src = "c:\Users\jkowa\Desktop\cwel.png";
  }
};

// =====================
// Funkcja Toggle Play/Pause w pasku
// =====================
function toggleBarPlay() {
  if (globalAudio.paused) {
    globalAudio.play();
    document.getElementById("bar-play-icon").textContent = "⏸";
  } else {
    globalAudio.pause();
    document.getElementById("bar-play-icon").textContent = "▶";
  }
}
window.toggleBarPlay = toggleBarPlay; // udostępniamy globalnie, bo onclick w HTML

// =====================
// Funkcja Zamknięcia paska
// =====================
function closeBar() {
  globalAudio.pause();
  globalAudio.src = "";
  spotifyBar.style.display = "none";
  updateProgress(0);
}
window.closeBar = closeBar; // globalnie

// =====================
// Aktualizacja paska progresu podczas odtwarzania
// =====================
globalAudio.addEventListener("timeupdate", () => {
  if (!isDragging && globalAudio.duration) {
    const percent = (globalAudio.currentTime / globalAudio.duration) * 100;
    updateProgress(percent);
  }

  // Liczniki
  currentTimeElem.textContent = formatTime(globalAudio.currentTime);
  durationElem.textContent = formatTime(globalAudio.duration);
});

function updateProgress(percent) {
  progressFilled.style.width = percent + "%";
  progressHandle.style.left = percent + "%";
}

// =====================
// Kliknięcie w pasek – przenosi do wybranego momentu
// =====================
function seek(event) {
  const rect = progressBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  let percent = clickX / width;
  if (globalAudio.duration) {
    globalAudio.currentTime = percent * globalAudio.duration;
  }
}
window.seek = seek; // globalnie dostępne w onclick HTML

// =====================
// Obsługa przeciągania suwaka progresu
// =====================
progressHandle.addEventListener("mousedown", (e) => {
  e.preventDefault();
  isDragging = true;

  function onMouseMove(moveEvent) {
    const rect = progressBar.getBoundingClientRect();
    let percent = (moveEvent.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    updateProgress(percent * 100);
  }

  function onMouseUp(upEvent) {
    const rect = progressBar.getBoundingClientRect();
    let percent = (upEvent.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    if (globalAudio.duration) {
      globalAudio.currentTime = percent * globalAudio.duration;
    }
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

// =====================
// PRZESZUKIWANIE TRACKÓW
// =====================
function filterTracks() {
  const input = document.getElementById("mainSearch").value.toLowerCase();
  const resultsBox = document.getElementById("search-results");
  const allTrackNodes = document.querySelectorAll(".track-item .track-title, .track-item");

  resultsBox.innerHTML = "";
  let matches = 0;

  allTrackNodes.forEach((node) => {
    const trackText = node.textContent.toLowerCase();
    if (trackText.includes(input) && input.length > 0) {
      const result = document.createElement("div");
      result.className = "track";
      result.textContent = node.textContent;
      resultsBox.appendChild(result);
      matches++;
    }
  });
  resultsBox.style.display = matches > 0 ? "block" : "none";
}
window.filterTracks = filterTracks; // globalnie dostępne w oninput HTML

// =====================
// Upewnij się, że kliknięcie w .track-item wywołuje playTrack
// (jeżeli wolisz, nie musisz ustawiać onclick w HTML – poniższy fragment zrobi to automatycznie)
// =====================
document.querySelectorAll("details.album-details").forEach((detail) => {
  const tracklist = detail.querySelector(".tracklist-container");

  detail.addEventListener("toggle", () => {
    if (detail.open) {
      // Rozwijanie
      detail.classList.add("opening");
      const scrollHeight = tracklist.scrollHeight;

      tracklist.style.maxHeight = scrollHeight + "px";

      setTimeout(() => {
        tracklist.style.maxHeight = "none";
      }, 500);
    } else {
      // Zwijanie
      const height = tracklist.scrollHeight;
      tracklist.style.maxHeight = height + "px"; // szybki reset
      detail.classList.remove("opening");

      // Trigger animacji zwijania
      requestAnimationFrame(() => {
        tracklist.style.maxHeight = "0";
      });
    }
  });
});


const volumeSlider = document.getElementById("volume-slider");
if (volumeSlider) {
  volumeSlider.addEventListener("input", (e) => {
    globalAudio.volume = e.target.value;
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" + secs : secs}`;
}

const currentTimeElem = document.getElementById("current-time");
const durationElem = document.getElementById("duration");

const barPlayIcon = document.getElementById("bar-play-icon");

document.getElementById("bar-play-icon").textContent = "⏸";





function toggleSettings() {
  const menu = document.getElementById('settings-menu');
  menu.classList.toggle('visible');
  menu.classList.toggle('hidden');
}

function toggleTheme() {
  const body = document.body;
  if (body.style.backgroundColor === 'white') {
    body.style.backgroundColor = '#111';
    body.style.color = '#eee';
  } else {
    body.style.backgroundColor = 'white';
    body.style.color = '#111';
  }
}

// Auto-zamykanie jak klikniesz gdzieś indziej
document.addEventListener('click', function (event) {
  const menu = document.getElementById('settings-menu');
  const button = document.querySelector('.settings-dropdown button');

  if (!menu.contains(event.target) && !button.contains(event.target)) {
    menu.classList.remove('visible');
    menu.classList.add('hidden');
  }

  function filterTracks() {
  const input = document.getElementById("mainSearch").value.toLowerCase();
  const results = document.getElementById("search-results");
  results.innerHTML = "";

  if (input.length < 2) {
    results.style.display = "none";
    return;
  }

  const tracks = document.querySelectorAll(".track-item");

  tracks.forEach(track => {
    const title = track.innerText.toLowerCase();

    if (title.includes(input)) {

      const result = document.createElement("div");
      result.className = "track";
      result.innerText = track.innerText;

      result.onclick = () => {

        const album = track.closest(".album-details");

        if (!album.open) {
          album.open = true;
        }

        setTimeout(() => {

          track.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

          track.classList.add("highlight");

          setTimeout(() => {
            track.classList.remove("highlight");
          }, 2000);

        }, 300);

        results.style.display = "none";
        document.getElementById("mainSearch").value = "";
      };

      results.appendChild(result);
    }

  });

  results.style.display = "block";
}
});
