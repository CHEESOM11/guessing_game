const Session = require("../models/Session");

// Get all sessions
const getAllSessions = async (req, res) => {
    try {

        const sessions = await Session.find();

        res.status(200).json(sessions);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// Get one session
const getSession = async (req, res) => {

    try {

        const session = await Session.findOne({
            sessionCode: req.params.sessionCode
        });

        if (!session) {

            return res.status(404).json({
                message: "Session not found"
            });

        }

        res.status(200).json(session);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Delete session
const deleteSession = async (req, res) => {

    try {

        await Session.findOneAndDelete({
            sessionCode: req.params.sessionCode
        });

        res.status(200).json({
            message: "Session deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    getAllSessions,
    getSession,
    deleteSession
};