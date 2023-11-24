document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('videoPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeControl = document.getElementById('volumeControl');
    const customControls = document.getElementById('custom-controls');
    const liveDot = document.getElementById('liveDot');
    
    let isPlaying = false; // Track the playback state

    // WebSocket connection
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        processWebSocketMessage(data);
    };

    async function processWebSocketMessage(data) {
        if (data.type === 'currentTime') {
            // Update the video's currentTime without triggering a seek event
            video.currentTime = data.data;
        }
    }

    playPauseBtn.addEventListener('click', function() {
        if (isPlaying) {
            video.pause();
            playPauseBtn.textContent = 'Play';
        } else {
            video.play();
            playPauseBtn.textContent = 'Pause';
        }
        isPlaying = !isPlaying;
        sendUpdateTime();
    });

    video.addEventListener('timeupdate', function() {
        // Do not send the update at every time change to reduce WebSocket traffic
        if (Math.abs(video.currentTime - lastSentTime) >= 1) {
            sendUpdateTime();
        }
    });

    volumeControl.addEventListener('input', function() {
        video.volume = volumeControl.value;
    });

    let lastSentTime = 0;

    async function sendUpdateTime() {
        const currentTime = video.currentTime;
        ws.send(JSON.stringify({ type: 'updateTime', data: currentTime }));
        lastSentTime = currentTime;
    }
});


    async function sendUpdateTime() {
        const currentTime = video.currentTime;
        ws.send(JSON.stringify({ type: 'updateTime', data: currentTime }));
    }
});
