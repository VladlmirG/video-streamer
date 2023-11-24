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
        } else if (data.type === 'isPlaying') {
            // Toggle play/pause based on the received state
            if (data.isPlaying) {
                video.play();
            } else {
                video.pause();
            }
        }
    }

    video.addEventListener('loadeddata', function() {
        // Start the loop when the video is loaded
        video.play();
    });

    video.addEventListener('click', function() {
        // Toggle play/pause state on video click
        ws.send(JSON.stringify({ type: 'playPause' }));
    });
});
