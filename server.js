const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentPlaybackTime = 0;
let isPlaying = true; // Initial state is playing
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

// Broadcast current playback time and play/pause state to all clients at regular intervals
setInterval(() => {
    updatePlaybackTime();
    broadcastState();
}, 1000); // Adjust the interval as needed

// WebSocket connection handling
wss.on('connection', (ws) => {
    // Send the current playback time and play/pause state to the new client
    ws.send(JSON.stringify({ type: 'currentTime', data: currentPlaybackTime, isPlaying }));

    // Handle messages from clients
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'updateTime') {
            // Update the current playback time
            currentPlaybackTime = data.data;
            // Broadcast the updated time and play/pause state to all connected clients
            broadcastState();
        } else if (data.type === 'playPause') {
            // Toggle play/pause state
            isPlaying = !isPlaying;
            // Broadcast the updated play/pause state to all connected clients
            broadcastState();
        }
    });

    // Handle WebSocket connection closing
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function updatePlaybackTime() {
    // Update the current playback time only if the video is playing
    if (isPlaying) {
        currentPlaybackTime = (currentPlaybackTime + 1) % loopDuration;
    }
}

function broadcastState() {
    // Broadcast the updated time and play/pause state to all connected clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'currentTime', data: currentPlaybackTime, isPlaying }));
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
