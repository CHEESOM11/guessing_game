const Session = require('../models/Session');

const { v4: uuidv4 } = require('uuid');

const GAME_TIME_LIMIT = 60;
const activeTimers = new Map();

//Stop and remove an active timer
function clearGameTimer(sessionId) {
    const timer = activeTimers.get(sessionId);
    if (timer) {
        clearInterval(timer.intervalId);
        activeTimers.delete(sessionId);
    }
}
// Start countdown
function startGameTimer(io, sessionId) {
    clearGameTimer(sessionId);

    let timeLeft = GAME_TIME_LIMIT;

    io.to(sessionId).emit('timerUpdate', { timeLeft });

    const intervalId = setInterval(async () => {
        timeLeft -= 1;

        if (timeLeft > 0) {
            io.to(sessionId).emit('timerUpdate', { timeLeft });
            return;
        }

        clearGameTimer(sessionId);

        const currentSession = await Session.findOne({ sessionId });
        if (currentSession && currentSession.status === 'active') {
            currentSession.status = 'ended';
            await currentSession.save();
            io.to(sessionId).emit('timeUp', {
                winner: null,
                answer: currentSession.answer,
                scores: currentSession.players,
            });
        }
    }, 1000);

    activeTimers.set(sessionId, { intervalId });
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`A user connected ${socket.id}`);

        // Create a session
        socket.on('createSession', async (username) => {
            const sessionId = uuidv4()
                .slice(0, 6)
                .toUpperCase();

            const trimmedUsername = username.trim();
            const session = await Session.create({
                sessionId,
                gameMaster: socket.id,
                players: [{ socketId: socket.id, username: trimmedUsername, score: 0 }],
                status: 'waiting',
            });
            socket.join(sessionId);
            io.to(sessionId).emit('sessionCreated', {
                sessionId: session.sessionId,
                gameMaster: trimmedUsername,
                players: session.players,
            });
        });

        // Join a session
        socket.on('joinSession', async ({ sessionId, username }) => {
            const session = await Session.findOne({ sessionId });
            if (!session) {
                return socket.emit('error', 'Session not found');
            }
            if (session.status === 'active') {
                return socket.emit('error', 'Game in progress');
            }

            const usernameExists = session.players.some(
                player => player.username.toLowerCase() === username.toLowerCase()
            );
        
            if (usernameExists) {
                return socket.emit(
                    "errorMessage",
                    "Username already exists. Please choose another username."
                );
            }
        

            session.players.push({ socketId: socket.id, username, score: 0, attempts: 3 });
            await session.save();

            const gameMasterPlayer = session.players.find(
                player => player.socketId === session.gameMaster
            );
            const gameMasterUsername = gameMasterPlayer?.username || '';

            socket.join(sessionId);
            socket.emit('sessionJoined', {
                sessionId: session.sessionId,
                gameMaster: gameMasterUsername,
                players: session.players,
            });
            io.to(sessionId).emit('playerJoined', { username });
            io.to(sessionId).emit('playersUpdated', {
                players: session.players,
                gameMaster: gameMasterUsername,
            });
        });

        // Create a question
        socket.on('createQuestion', async ({ sessionId, question, answer }) => {
            const session = await Session.findOne({ sessionId });
            if (!session) return;

            if (session.gameMaster !== socket.id) return;

            session.question = question;
            session.answer = answer.toLowerCase();
            await session.save();
            io.to(sessionId).emit('questionCreated', { question, answer });
        });

        // Start the game
        socket.on('startGame', async ({ sessionId }) => {
            const session = await Session.findOne({ sessionId });
            if (!session) return;
            if (session.gameMaster !== socket.id) return;
            if (session.players.length < 3) {
                return socket.emit('error', 'Need at least 3 players');
            }

            session.status = 'active';
            session.expiresAt = new Date(Date.now() + GAME_TIME_LIMIT * 1000);

            await session.save();
            io.to(sessionId).emit('gameStarted', {
                question: session.question,
                timeLimit: GAME_TIME_LIMIT,
            });

            startGameTimer(io, sessionId);
        });



        // Guess answer
        socket.on('guessAnswer', async ({sessionId, answer}) => {
            const session = await Session.findOne({ sessionId });
            if (!session || session.status !== 'active') return;

            const player = session.players.find(player => player.socketId === socket.id);
            if (!player.attempts) player.attempts = 0;

            player.attempts ++;
            if (player.attempts > 3) {
                return socket.emit('error', 'You have used all your attempts');
            }
            if (session.answer.toLowerCase() === answer.toLowerCase()) {
                player.score += 10;
                session.status = 'ended';
                session.winner = player.username;
                await session.save();
                io.to(sessionId).emit('winnerDeclared', {
                    winner: player.username,
                    answer: session.answer,
                    scores: session.players,
                });
            }
            await session.save();
        });
        
        // Leave session
        socket.on('disconnect', async () => {
            try {
                const session = await Session.findOne({ 'players.socketId': socket.id });
                if (!session) return;

                const leavingPlayer = session.players.find(player => player.socketId === socket.id);
                const leavingUsername = leavingPlayer?.username || socket.id;

                session.players = session.players.filter(player => player.socketId !== socket.id);

                const masterLeft = session.gameMaster === socket.id;
                if (masterLeft && session.players.length > 0) {
                    session.gameMaster = session.players[0].socketId;
                    io.to(session.sessionId).emit('newGameMaster', { gameMaster: session.players[0].username });
                }

                if (session.players.length === 0) {
                    await Session.findByIdAndDelete(session._id);
                    console.log(`Session ${session.sessionId} deleted`);
                } else {
                    await session.save();
                    io.to(session.sessionId).emit('playerLeft', { username: leavingUsername });
                    io.to(session.sessionId).emit('playersUpdated', {
                        players: session.players,
                        gameMaster: session.players.find(player => player.socketId === session.gameMaster)?.username || '',
                    });
                }

                console.log(`${socket.id} disconnected`);
            } catch (error) {
                console.error(error);
            }
        });
    });
};
