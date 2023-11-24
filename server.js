const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentPlaybackTime = 0;

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
    broadcastUpdateTime();
}, 1000); // Adjust the interval as needed

// WebSocket connection handling
wss.on('connection', (ws) => {
    // Send the current playback time to the new client
    ws.send(JSON.stringify({ type: 'currentTime', data: currentPlaybackTime }));

    // Handle messages from clients
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'updateTime') {
            // Update the current playback time
            currentPlaybackTime = data.data;
        }
    });

    // Handle WebSocket connection closing
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

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


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
