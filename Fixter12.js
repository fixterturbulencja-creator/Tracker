// =====================
// Fixter.js
// =====================

// ELEMENTY ODTWARZACZA
const globalAudio = document.getElementById("global-audio");
const spotifyBar = document.getElementById("spotify-bar");
const barTitle = document.getElementById("bar-track-title");
const barArt = document.getElementById("bar-art");
const barPlayIcon = document.getElementById("bar-play-icon");

const progressFilled = document.querySelector(".progress-filled");
const progressHandle = document.querySelector(".progress-handle");
const progressBar = document.querySelector(".progress-bar");

const currentTimeElem = document.getElementById("current-time");
const durationElem = document.getElementById("duration");

let isDragging = false;


// =====================
// ODTWARZANIE UTWORU
// =====================
window.playTrack = function (event, el) {

  event.stopPropagation();

  const trackItem = el.classList.contains("track-item")
    ? el
    : el.closest(".track-item");

  if (!trackItem) return;

  const audioSrc = trackItem.getAttribute("data-audio");
  if (!audioSrc) return;

  const title = trackItem.innerText;

  const cover =
    trackItem.closest(".album-details")
      ?.querySelector(".cover")?.src || "";

  if (globalAudio.src !== audioSrc) {

    globalAudio.src = audioSrc;
    globalAudio.currentTime = 0;

    barTitle.textContent = title;
    barArt.src = cover;

    updateProgress(0);

    currentTimeElem.textContent = "0:00";
    durationElem.textContent = "0:00";
  }

  spotifyBar.style.display = "flex";

  globalAudio.play();

  barPlayIcon.textContent = "⏸";
};


// =====================
// PLAY / PAUSE
// =====================
function toggleBarPlay() {

  if (globalAudio.paused) {

    globalAudio.play();
    barPlayIcon.textContent = "⏸";

  } else {

    globalAudio.pause();
    barPlayIcon.textContent = "▶";

  }

}

window.toggleBarPlay = toggleBarPlay;


// =====================
// ZAMYKANIE PASKA
// =====================
function closeBar() {

  globalAudio.pause();
  globalAudio.src = "";

  spotifyBar.style.display = "none";

  updateProgress(0);

}

window.closeBar = closeBar;


// =====================
// PROGRESS BAR
// =====================
globalAudio.addEventListener("timeupdate", () => {

  if (!isDragging && globalAudio.duration) {

    const percent =
      (globalAudio.currentTime / globalAudio.duration) * 100;

    updateProgress(percent);

  }

  currentTimeElem.textContent =
    formatTime(globalAudio.currentTime);

  durationElem.textContent =
    formatTime(globalAudio.duration);

});


function updateProgress(percent) {

  progressFilled.style.width = percent + "%";
  progressHandle.style.left = percent + "%";

}


// =====================
// SEEK
// =====================
function seek(event) {

  const rect = progressBar.getBoundingClientRect();

  const percent =
    (event.clientX - rect.left) / rect.width;

  if (globalAudio.duration) {

    globalAudio.currentTime =
      percent * globalAudio.duration;

  }

}

window.seek = seek;


// =====================
// DRAG PROGRESS
// =====================
progressHandle.addEventListener("mousedown", (e) => {

  e.preventDefault();

  isDragging = true;

  function move(e) {

    const rect = progressBar.getBoundingClientRect();

    let percent =
      (e.clientX - rect.left) / rect.width;

    percent = Math.max(0, Math.min(1, percent));

    updateProgress(percent * 100);

  }

  function up(e) {

    const rect = progressBar.getBoundingClientRect();

    let percent =
      (e.clientX - rect.left) / rect.width;

    percent = Math.max(0, Math.min(1, percent));

    if (globalAudio.duration) {

      globalAudio.currentTime =
        percent * globalAudio.duration;

    }

    isDragging = false;

    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);

  }

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);

});


// =====================
// FORMAT CZASU
// =====================
function formatTime(seconds) {

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs < 10 ? "0" + secs : secs}`;

}


// =====================
// GŁOŚNOŚĆ
// =====================
const volumeSlider =
  document.getElementById("volume-slider");

if (volumeSlider) {

  volumeSlider.addEventListener("input", (e) => {

    globalAudio.volume = e.target.value;

  });

}


// =====================
// ROZWIJANIE ALBUMÓW
// =====================
document
.querySelectorAll("details.album-details")
.forEach((detail) => {

  const tracklist =
    detail.querySelector(".tracklist-container");

  tracklist.style.overflow = "hidden";
  tracklist.style.maxHeight = "0";
  tracklist.style.transition = "max-height 0.5s ease";

  detail.addEventListener("toggle", () => {

    if (detail.open) {

      tracklist.style.maxHeight =
        tracklist.scrollHeight + "px";

      setTimeout(() => {

        tracklist.style.maxHeight = "none";

      }, 500);

    } else {

      tracklist.style.maxHeight =
        tracklist.scrollHeight + "px";

      requestAnimationFrame(() => {

        tracklist.style.maxHeight = "0";

      });

    }

  });

});


// =====================
// WYSZUKIWARKA
// =====================
function filterTracks() {

  const input = document.getElementById("mainSearch").value.toLowerCase();
  const results = document.getElementById("search-results");

  results.innerHTML = "";

  if (input.length < 1) {
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

        // OTWIERA KARTĘ
        if (!album.open) {
          album.open = true;
        }

        // SCROLL DO UTWORU
        setTimeout(() => {

          track.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

          // PODŚWIETLENIE
          track.classList.add("highlight");

          setTimeout(() => {
            track.classList.remove("highlight");
          }, 1000);

        }, 300);

        // ZAMYKA WYSZUKIWARKĘ
        results.style.display = "none";
        document.getElementById("mainSearch").value = "";

      };

      results.appendChild(result);

    }

  });

  results.style.display = "block";
}

window.filterTracks = filterTracks;


// =====================
// SETTINGS MENU
// =====================
function toggleSettings() {

  const menu =
    document.getElementById("settings-menu");

  menu.classList.toggle("visible");
  menu.classList.toggle("hidden");

}

function toggleTheme() {

  const body = document.body;

  if (body.style.backgroundColor === "white") {

    body.style.backgroundColor = "#111";
    body.style.color = "#eee";

  } else {

    body.style.backgroundColor = "white";
    body.style.color = "#111";

  }

}


// AUTO ZAMYKANIE MENU
document.addEventListener("click", (event) => {

  const menu =
    document.getElementById("settings-menu");

  const button =
    document.querySelector(".settings-dropdown button");

  if (!menu.contains(event.target) &&
      !button.contains(event.target)) {

    menu.classList.remove("visible");
    menu.classList.add("hidden");

  }

});
