document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('intro-audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const timeline = document.getElementById('player-timeline');
    const currentTimeText = document.getElementById('current-time');
    const durationTimeText = document.getElementById('duration-time');

    if (!audio || !playPauseBtn || !playIcon || !timeline || !currentTimeText || !durationTimeText) {
        return;
    }

    // Format seconds into minutes:seconds
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Toggle Play / Pause
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                playIcon.textContent = '⏸';
            }).catch(err => {
                console.error("Audio playback error: ", err);
            });
        } else {
            audio.pause();
            playIcon.textContent = '▶';
        }
    });

    // Update duration once metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
        timeline.max = Math.floor(audio.duration);
        durationTimeText.textContent = formatTime(audio.duration);
    });

    // Fallback: update duration if metadata was already loaded
    if (audio.readyState >= 1) {
        timeline.max = Math.floor(audio.duration);
        durationTimeText.textContent = formatTime(audio.duration);
    }

    // Update timeline and current time text as audio plays
    audio.addEventListener('timeupdate', () => {
        timeline.value = Math.floor(audio.currentTime);
        currentTimeText.textContent = formatTime(audio.currentTime);
    });

    // Seek audio when timeline value is adjusted
    timeline.addEventListener('input', () => {
        audio.currentTime = timeline.value;
        currentTimeText.textContent = formatTime(timeline.value);
    });

    // Handle end of playback
    audio.addEventListener('ended', () => {
        playIcon.textContent = '▶';
        timeline.value = 0;
        currentTimeText.textContent = '0:00';
    });
});
