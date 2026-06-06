// ─── ai.js Controller — Thin layer between route and agents ───
//
// WHY: Follows MVC pattern. Controller handles HTTP request/response,
// delegates all AI logic to the AGENTIC_AI folder.
// This keeps the controller thin (~30 lines) and agents independent.
//
// INTERVIEW: "The controller is intentionally thin — it only
// extracts request data and calls the orchestrator. All AI logic
// lives in the AGENTIC_AI folder, following separation of concerns."

const { processMessage } = require("../../AGENTIC_AI/orchestrator");
const Listing = require("../models/listing");

module.exports.chat = async (req, res) => {
  try {
    const { message, sessionId, listingId } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get the current hotel from MongoDB if provided (needed for RAG context)
    let hotel = null;
    if (listingId) {
        hotel = await Listing.findById(listingId).lean();
    }

    const userId = req.user ? req.user._id : null;

    // Delegate to orchestrator — all AI logic happens there
    const result = await processMessage(
      userId || sessionId || "default",
      message,
      hotel
    );

    res.json({
      reply: result.reply,
      intent: result.intent
    });

  } catch (err) {
    console.error("❌ AI Chat Error:", err.message);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
};
