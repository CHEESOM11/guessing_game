
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const sessionRoute = require('./routes/sessionRoute');
const gameSocket = require('./socket/gameSocket');

const app = express();
const server = http.createServer(app); 

// 1. Connect to Database
connectDB();

// 2. Global Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://guessing-game-teal.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// 3. API Routes
app.use('/api/sessions', sessionRoute);

// 4. Serve React Frontend (Production)
// Serves static files from the 'Client/dist' directory
app.use(express.static(path.join(__dirname, 'Client', 'dist')));

// Wildcard route to pass control to React Router for any non-API requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'dist', 'index.html'));
});

// 5. Initialize Socket.io
const io = new Server(server, { 
    cors: { 
        origin: [
            "http://localhost:5173",
            "https://guessing-game-teal.vercel.app"
        ],
        credentials: true
    } 
});

gameSocket(io);

// 6. Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});