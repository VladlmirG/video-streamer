const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, maxPayload: 1024 * 1024 * 10 }); // 10 MB

let currentPlaybackTime = 0;
let clients = new Set();

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

// WebSocket connection handling
wss.on('connection', (ws) => {
    // Send the current playback time to the new client
    ws.send(JSON.stringify({ type: 'currentTime', data: currentPlaybackTime }));

    // Add the new client to the set
    clients.add(ws);

    // Handle messages from clients
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'updateTime') {
            // Update the current playback time
            currentPlaybackTime = data.data;

            // Broadcast the updated time to all connected clients
            broadcast({ type: 'currentTime', data: currentPlaybackTime });
        }
    });

    // Handle WebSocket connection closing
    ws.on('close', () => {
        console.log('Client disconnected');
        // Remove the disconnected client from the set
        clients.delete(ws);
    });
});

function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
