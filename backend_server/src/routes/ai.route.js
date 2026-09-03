const express = require("express");
const checkIfAuthenticated = require("../middleware.js");
const { handleAiQuery } = require("../controller/ai");

const router = express.Router();

// Require authentication for AI endpoints
router.use(checkIfAuthenticated);

// POST /api/ai/ask
router.post("/ask", handleAiQuery);

module.exports = router;
