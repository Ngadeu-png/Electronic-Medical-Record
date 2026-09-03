const express = require("express");
const checkIfAuthenticated = require("../middleware.js");
const {
  handleAiQuery,
  getChatHistory,
  clearChatHistory,
  getContextOptions,
} = require("../controller/ai");

const router = express.Router();

// Require authentication for AI endpoints
router.use(checkIfAuthenticated);

// POST /api/ai/ask - Submit question with target context
router.post("/ask", handleAiQuery);

// GET /api/ai/history - Retrieve stored conversation history
router.get("/history", getChatHistory);

// DELETE /api/ai/history - Clear conversation history for user
router.delete("/history", clearChatHistory);

// GET /api/ai/context-options - Retrieve available patients, records, or doctors for dropdowns
router.get("/context-options", getContextOptions);

module.exports = router;
