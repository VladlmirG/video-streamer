const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentPlaybackTime = 0;
const loopDuration = 60; // Set the duration of your video loop in seconds

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set proper headers to allow cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve video files from the 'videos' directory
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));

// Broadcast current playback time to all clients at regular intervals
setInterval(() => {
    updatePlaybackTime();
}, 1000); // Adjust the interval as needed

// WebSocket connection handling
wss.on('connection', (ws) => {
    // Send the current playback time to the new client
    ws.send(JSON.stringify({ type: 'currentTime', data: currentPlaybackTime }));

    // Handle WebSocket connection closing
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function updatePlaybackTime() {
    // Update the current playback time
    currentPlaybackTime = (currentPlaybackTime + 1) % loopDuration;

    // Broadcast the updated time to all connected clients
    broadcastUpdateTime();
}

function broadcastUpdateTime() {
    // Broadcast the updated time to all connected clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'currentTime', data: currentPlaybackTime }));
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
