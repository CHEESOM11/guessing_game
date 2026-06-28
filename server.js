require('dotenv').config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

const sessionRoute = require('./routes/sessionRoute');

const gameSocket = require('./socket/gameSocket');

const app = express();
const server = http.createServer(app); 

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/sessions', sessionRoute);

const io = new Server(server, { cors: { origin: "*" } });
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err.message));

gameSocket(io);

const PORT = process.env.PORT || 4000;

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});