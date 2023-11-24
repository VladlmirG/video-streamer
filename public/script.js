document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('videoPlayer');
    const liveDot = document.getElementById('liveDot');

    // WebSocket connection
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = async function (event) {
        const data = JSON.parse(event.data);
        await processWebSocketMessage(data);
    };

    async function processWebSocketMessage(data) {
        if (data.type === 'currentTime') {
            // Update the video's currentTime without triggering a seek event
            video.currentTime = data.data;
        }
    }

    video.addEventListener('loadeddata', function () {
        // Send a message to the server to request the current status
        ws.send(JSON.stringify({ type: 'requestStatus' }));
    });

    video.addEventListener('timeupdate', function () {
        // Send the current playback time to the server asynchronously
        sendUpdateTime();
    });

    async function sendUpdateTime() {
        const currentTime = video.currentTime;
        ws.send(JSON.stringify({ type: 'updateTime', data: currentTime }));
    }

    // Autoplay the video
    video.autoplay = true;

    // Hide controls, play/pause button, and volume control
    video.controls = false;

    // Hide play/pause button
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.style.display = 'none';
    }

    // Hide volume control
    const volumeControl = document.getElementById('volumeControl');
    if (volumeControl) {
        volumeControl.style.display = 'none';
    }

    // Hide custom controls
    const customControls = document.getElementById('custom-controls');
    if (customControls) {
        customControls.style.display = 'none';
    }

    // Display the live dot
    if (liveDot) {
        liveDot.style.display = 'block';
    }
});
