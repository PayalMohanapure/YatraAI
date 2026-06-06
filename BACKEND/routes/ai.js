// ─── ai.js Route — Single endpoint for AI chat ───
//
// POST /api/chat — receives user message, returns AI response
// This is the only route needed. The orchestrator handles everything else.

const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai");

router.post("/chat", aiController.chat);

module.exports = router;
