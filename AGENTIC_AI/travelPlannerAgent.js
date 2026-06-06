// ─── travelPlannerAgent.js — Itinerary + Budget + Weather Agent ───
//
// WHY: This is the MERGED agent that handles:
//   1. Day-by-day itinerary planning
//   2. Budget estimation (hotel + food + transport + activities)
//   3. Weather-based travel advice
//
// We merged 3 separate agents into 1 because:
//   - Budget is always part of a trip plan
//   - Weather affects itinerary choices
//   - One LLM call instead of 3 = 3x cheaper
//
// INTERVIEW: "I merged itinerary, budget, and weather into a single
// agent to reduce LLM calls from 3 to 1. The system prompt instructs
// the model to include all three aspects in one structured response,
// saving ~66% on token costs."

const { client, MODEL, MAX_TOKENS } = require("./config");
const { buildMessages } = require("./memory");

async function handleTravelPlanner(sessionId, userMessage, ragContext, hotel) {
  const systemPrompt = `You are YatraAI's Travel Planner — an expert on Indian travel.

${hotel ? `CURRENT HOTEL: ${hotel.title} in ${hotel.location} at ₹${hotel.price}/night` : `NO HOTEL SELECTED: The user is browsing generally. Recommend popular destinations and average hotel prices if asked.`}

YOUR JOB: Create comprehensive travel plans that include ALL of these:

1. 📅 DAY-BY-DAY ITINERARY
   - Morning, Afternoon, Evening activities
   - Include timings and travel tips
   - Mix popular spots with hidden gems

2. 💰 BUDGET BREAKDOWN
   ${hotel ? `- Hotel cost (nights × ₹${hotel.price})` : `- Estimated average hotel cost (nights × ₹2000-5000)`}
   - Food estimate (₹500-2000/day depending on style)
   - Transport estimate
   - Activities/entry fees
   - Total estimated cost

3. 🌤️ WEATHER ADVICE
   - Expected weather for the destination
   - What to pack
   - Best time to visit tip

RULES:
- Use emojis for section headers
- Keep it structured with clear formatting
- If user doesn't specify days, suggest 3 days
- Use the REAL hotel data provided to recommend alternatives
- Prices in ₹ (Indian Rupees)
- Be specific to the Indian city mentioned`;

  const messages = await buildMessages(sessionId, systemPrompt, ragContext);

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0.7,  // some creativity for itinerary suggestions
    messages
  });

  return response.choices[0].message.content;
}

module.exports = { handleTravelPlanner };
