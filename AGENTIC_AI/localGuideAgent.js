// ─── localGuideAgent.js — Local Guide + RAG + Google Places Agent ───
//
// Uses RAG (MongoDB hotel data) + Google Places API (real restaurants)
// to give verified, production-quality recommendations.

const { client, MODEL, MAX_TOKENS } = require("./config");
const { buildMessages } = require("./memory");
const { getNearbyPlacesContext } = require("./places");

async function handleLocalGuide(sessionId, userMessage, ragContext, hotel) {
  let coords = null;
  let placesContext = null;

  if (hotel) {
      coords = hotel.geometry.coordinates; // [longitude, latitude]
      // Fetch REAL nearby places from Google Places API
      placesContext = await getNearbyPlacesContext(coords[1], coords[0]);
  }

  const systemPrompt = `You are YatraAI's Local Guide — a food and culture expert for Indian cities.

${hotel ? `CURRENT HOTEL: ${hotel.title}
LOCATION: ${hotel.location} (Coordinates: ${coords[1]}°N, ${coords[0]}°E)
HOTEL RATING: ${hotel.rating}/5 | ${hotel.starRating} Star

YOUR JOB: Give personalized local recommendations near this hotel.

CRITICAL RULES:
- When recommending restaurants or attractions, ONLY use the REAL VERIFIED data provided below.
- Do NOT invent or hallucinate any place names.
- If no verified data is available, say "I recommend checking Google Maps for nearby options."
- Include the rating and review count from the verified data.
- Use emojis for categories.
- Be specific to ${hotel.location}.
- Mention approximate walking/rickshaw distances.` : `NO HOTEL SELECTED: The user is browsing generally. Recommend famous restaurants and cultural attractions across India.`}

🍽️ For FOOD: ${hotel ? `Use the verified restaurants list below.` : `Share famous regional Indian dishes.`}
🏛️ For SIGHTSEEING: ${hotel ? `Use the verified attractions list below.` : `Share famous Indian landmarks.`}
🎭 For CULTURE: ${hotel ? `Share general cultural tips for ${hotel.location}.` : `Share Indian cultural tips.`}
🏨 For HOTEL ALTERNATIVES: Use the hotel data from our database.`;

  // Combine RAG context (hotels) + Places context (restaurants/attractions)
  let fullContext = ragContext || "";
  if (placesContext) {
    fullContext += "\n\n" + placesContext;
  }

  const messages = await buildMessages(sessionId, systemPrompt, fullContext);

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0.7,
    messages
  });

  return response.choices[0].message.content;
}

module.exports = { handleLocalGuide };
