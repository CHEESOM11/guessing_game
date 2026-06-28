const express = require("express");
const router = express.Router();

const {
    getAllSessions,
    getSession,
    deleteSession
} = require("../controllers/sessionController");

// Get all active sessions
router.get("/", getAllSessions);

// Get one session
router.get("/:sessionCode", getSession);

// Delete session
router.delete("/:sessionCode", deleteSession);

module.exports = router;