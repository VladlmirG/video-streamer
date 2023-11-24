document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('videoPlayer');
    
    // WebSocket connection
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        processWebSocketMessage(data);
    };

    function processWebSocketMessage(data) {
        if (data.type === 'currentTime') {
            // Update the video's currentTime without triggering a seek event
            video.currentTime = data.data;
        }
    }

    video.addEventListener('loadeddata', function() {
        // Start the loop when the video is loaded
        video.play();
    });
});

