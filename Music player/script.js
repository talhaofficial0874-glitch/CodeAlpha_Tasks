// Array of songs with royalty-free music URLs for demonstration
const songs = [
    {
        title: "Summer Walk",
        artist: "Olexy",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
        src: "https://cdn.pixabay.com/download/audio/2022/01/21/audio_31743c58cd.mp3?filename=summer-walk-152722.mp3"
    },
    {
        title: "Lofi Study",
        artist: "FASSounds",
        cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80",
        src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf58b.mp3?filename=lofi-study-112191.mp3"
    },
    {
        title: "Good Night",
        artist: "FASSounds",
        cover: "https://images.unsplash.com/photo-1531306728370-53bf9ce4546c?w=500&q=80",
        src: "https://cdn.pixabay.com/download/audio/2022/12/28/audio_66eb89df0b.mp3?filename=good-night-160166.mp3"
    },
    {
        title: "Chill Abstract",
        artist: "Coma-Media",
        cover: "https://images.unsplash.com/photo-1493225457124-a1a2a5f308a0?w=500&q=80",
        src: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=chill-abstract-intention-116928.mp3"
    },
    {
        title: "Cali",
        artist: "Wataboi",
        cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80",
        src: "https://cdn.pixabay.com/download/audio/2022/04/27/audio_8ba206bb3d.mp3?filename=cali-1171.mp3"
    }
];

// DOM Elements
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const albumArtContainer = document.getElementById('album-art');

const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

const volumeSlider = document.getElementById('volume-slider');
const volUpBtn = document.getElementById('vol-up');
const volDownBtn = document.getElementById('vol-down');

const addSongBtn = document.getElementById('add-song-btn');
const fileUpload = document.getElementById('file-upload');

const playlistBtn = document.getElementById('playlist-btn');
const closePlaylistBtn = document.getElementById('close-playlist');
const playlistPanel = document.getElementById('playlist-panel');
const player = document.querySelector('.player');
const playlistList = document.getElementById('playlist-list');

// State
let songIndex = 0;
let isPlaying = false;

// Initialize Player
function initPlayer() {
    loadSong(songs[songIndex]);
    renderPlaylist();
    
    // Set initial volume
    audio.volume = volumeSlider.value;
}

// Load Song Details
function loadSong(song) {
    title.innerText = song.title;
    artist.innerText = song.artist;
    cover.src = song.cover;
    audio.src = song.src;
    
    // Reset Progress
    progressBar.style.width = '0%';
    currentTimeEl.innerText = '0:00';
    
    updatePlaylistHighlight();
}

// Play Song
function playSong() {
    isPlaying = true;
    playIcon.className = 'ri-pause-fill';
    albumArtContainer.classList.add('playing');
    
    // Animate play button
    playBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { playBtn.style.transform = 'scale(1)'; }, 150);
    
    audio.play();
}

// Pause Song
function pauseSong() {
    isPlaying = false;
    playIcon.className = 'ri-play-fill';
    albumArtContainer.classList.remove('playing');
    audio.pause();
}

// Play/Pause Toggle
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

// Previous Song
function prevSong() {
    songIndex--;
    if (songIndex < 0) {
        songIndex = songs.length - 1;
    }
    loadSong(songs[songIndex]);
    if (isPlaying) playSong();
}

// Next Song
function nextSong() {
    songIndex++;
    if (songIndex > songs.length - 1) {
        songIndex = 0;
    }
    loadSong(songs[songIndex]);
    if (isPlaying) playSong();
}

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// Update Progress Bar & Time
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    
    if (isNaN(duration)) return;
    
    // Update Progress Bar
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Update Time Text
    const currentMins = Math.floor(currentTime / 60);
    let currentSecs = Math.floor(currentTime % 60);
    if (currentSecs < 10) currentSecs = `0${currentSecs}`;
    currentTimeEl.innerText = `${currentMins}:${currentSecs}`;
    
    const durationMins = Math.floor(duration / 60);
    let durationSecs = Math.floor(duration % 60);
    if (durationSecs < 10) durationSecs = `0${durationSecs}`;
    if (durationMins) {
        durationEl.innerText = `${durationMins}:${durationSecs}`;
    }
}

audio.addEventListener('timeupdate', updateProgress);

// Load Metadata to show duration immediately
audio.addEventListener('loadedmetadata', () => {
    const duration = audio.duration;
    const durationMins = Math.floor(duration / 60);
    let durationSecs = Math.floor(duration % 60);
    if (durationSecs < 10) durationSecs = `0${durationSecs}`;
    durationEl.innerText = `${durationMins}:${durationSecs}`;
});

// Set Progress Bar by clicking
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
    
    if (!isPlaying) playSong();
}

progressContainer.addEventListener('click', setProgress);

// Autoplay next song
audio.addEventListener('ended', nextSong);

// Volume Control
function updateVolume(value) {
    audio.volume = value;
    volumeSlider.value = value;
}

volumeSlider.addEventListener('input', (e) => {
    updateVolume(e.target.value);
});

volUpBtn.addEventListener('click', () => {
    let currentVol = parseFloat(volumeSlider.value);
    currentVol = Math.min(1, currentVol + 0.1);
    updateVolume(currentVol);
});

volDownBtn.addEventListener('click', () => {
    let currentVol = parseFloat(volumeSlider.value);
    currentVol = Math.max(0, currentVol - 0.1);
    updateVolume(currentVol);
});

// Add Local Song
addSongBtn.addEventListener('click', () => {
    fileUpload.click();
});

fileUpload.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        const firstNewIndex = songs.length;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const objectURL = URL.createObjectURL(file);
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            
            songs.push({
                title: fileName,
                artist: "Local File",
                cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
                src: objectURL
            });
        }
        renderPlaylist();
        songIndex = firstNewIndex;
        loadSong(songs[songIndex]);
        playSong();
        
        // Clear input to allow adding the same file again if needed
        fileUpload.value = '';
    }
});

// Playlist Panel Toggle
playlistBtn.addEventListener('click', () => {
    playlistPanel.classList.add('active');
    player.classList.add('slide-left');
});

closePlaylistBtn.addEventListener('click', () => {
    playlistPanel.classList.remove('active');
    player.classList.remove('slide-left');
});

// Render Playlist
function renderPlaylist() {
    playlistList.innerHTML = '';
    
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.classList.add('playlist-item');
        if (index === songIndex) {
            li.classList.add('playing');
        }
        
        li.innerHTML = `
            <img src="${song.cover}" alt="${song.title}" class="item-img">
            <div class="item-info">
                <h4 class="item-title">${song.title}</h4>
                <p class="item-artist">${song.artist}</p>
            </div>
            <div class="item-animation">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </div>
        `;
        
        li.addEventListener('click', () => {
            songIndex = index;
            loadSong(songs[songIndex]);
            playSong();
            updatePlaylistHighlight();
            
            // Optionally close playlist on mobile
            // playlistPanel.classList.remove('active');
            // player.classList.remove('slide-left');
        });
        
        playlistList.appendChild(li);
    });
}

// Update Playlist Highlight
function updatePlaylistHighlight() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === songIndex) {
            item.classList.add('playing');
        } else {
            item.classList.remove('playing');
        }
    });
}

// Start
initPlayer();
