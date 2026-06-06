// ─── orchestrator.js — The Brain of the Multi-Agent System ───
//
// WHY: We have multiple specialist agents. The orchestrator decides
// WHICH agent should handle the user's query.
//
// HOW: Uses a tiny classification prompt (~100 tokens) to detect intent:
//   "Plan 3 days in Goa"        → TRAVEL_PLANNER
//   "Best restaurants nearby"   → LOCAL_GUIDE
//   "Hello / Thanks"            → GENERAL (answers directly)
//
// INTERVIEW: "The orchestrator uses a lightweight intent classifier
// that costs ~100 tokens per call. It routes to specialist agents
// instead of one monolithic prompt, following the Single Responsibility
// Principle. This makes each agent focused and easier to improve."

const { client, MODEL, MAX_TOKENS } = require("./config");
const { addMessage, buildMessages } = require("./memory");
const { buildRAGContext } = require("./rag");
const { handleTravelPlanner } = require("./travelPlannerAgent");
const { handleLocalGuide } = require("./localGuideAgent");

// ─── STEP 1: Classify user intent using a tiny prompt ───
// This is the "router" — it reads the user's message and picks a category
// Uses max_tokens: 20 because we only need one word back
async function classifyIntent(userMessage) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 20,
    temperature: 0,   // 0 = deterministic, always same answer for same input
    messages: [
      {
        role: "system",
        content: `Classify this travel query into exactly one category. Reply with ONLY the category name, nothing else.

Categories:
- TRAVEL_PLANNER: trip planning, itinerary, budget, cost, weather, days, schedule
- LOCAL_GUIDE: food, restaurants, sightseeing, nearby, attractions, culture, temples
- GENERAL: greetings, thanks, general questions, anything else`
      },
      { role: "user", content: userMessage }
    ]
  });

  const intent = response.choices[0].message.content.trim().toUpperCase();

  // Fallback to GENERAL if classification returns something unexpected
  if (["TRAVEL_PLANNER", "LOCAL_GUIDE", "GENERAL"].includes(intent)) {
    return intent;
  }
  return "GENERAL";
}

// ─── STEP 2: Main orchestrator function ───
// This is called for every user message from the chat widget
async function processMessage(sessionId, userMessage, currentHotel) {

  // 1. Add user's message to memory
  await addMessage(sessionId, "user", userMessage);

  // 2. Get RAG context (real hotel data from MongoDB)
  const ragContext = await buildRAGContext(currentHotel);

  // 3. Classify intent (~100 tokens, very cheap)
  const intent = await classifyIntent(userMessage);
  console.log(`🧠 Intent: ${intent} | Message: "${userMessage}"`);

  let reply;

  // 4. Route to the right agent based on intent
  switch (intent) {
    case "TRAVEL_PLANNER":
      reply = await handleTravelPlanner(sessionId, userMessage, ragContext, currentHotel);
      break;

    case "LOCAL_GUIDE":
      reply = await handleLocalGuide(sessionId, userMessage, ragContext, currentHotel);
      break;

    case "GENERAL":
    default:
      // General questions — orchestrator answers directly
      reply = await handleGeneral(sessionId, userMessage, ragContext, currentHotel);
      break;
  }

  // 5. Save assistant's reply to memory
  await addMessage(sessionId, "assistant", reply);

  return { reply, intent };
}

// ─── GENERAL handler — for greetings and simple questions ───
async function handleGeneral(sessionId, userMessage, ragContext, hotel) {
  const systemPrompt = `You are YatraAI, a friendly travel concierge for Indian hotels.
${hotel ? `You are currently helping a guest looking at "${hotel.title}" in ${hotel.location}.` : `You are currently helping a guest plan their travel across India on the homepage.`}
Keep responses short (2-3 sentences max). Be warm and helpful.
If the user greets you, introduce yourself and suggest what you can help with:
- Plan a trip itinerary
- Find nearby restaurants and attractions
- Estimate travel budget
- Weather advice`;

  const messages = await buildMessages(sessionId, systemPrompt, ragContext);

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0.7,
    messages
  });

  return response.choices[0].message.content;
}

module.exports = { processMessage };
