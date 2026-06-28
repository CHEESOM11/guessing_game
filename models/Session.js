const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({

    socketId: String, 

    username: {
        type: String,
        required: true,
    },

    score: {
        type: Number,
        default: 0,
    },

    attempts: {
        type: Number,
        default: 3,
    },
});


const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },

    gameMaster: { type: String, required: true },

    players: [playerSchema],
    
    question: String,

    answer: String,

    status: {
        type: String,
        enum: ["waiting", "active", "ended",],
        default: "waiting",
    },

    winner: String,
    
    expiresAt: { type: Date, timestamps: true },
});



module.exports = mongoose.model('Session', sessionSchema);