// ─── rag.js — Retrieval Augmented Generation ───
//
// WHY: Without RAG, the AI will HALLUCINATE fake hotel names and prices.
// With RAG, we query MongoDB for REAL hotels, then inject that data
// into the LLM prompt so it answers using actual facts.
//
// HOW IT WORKS:
//   1. User asks "cheap hotels in Goa?"
//   2. rag.js queries MongoDB: db.find({ location: /Goa/, price < 2000 })
//   3. Real results injected into prompt: "Here are 5 real hotels: ..."
//   4. LLM generates answer grounded in REAL data ✅
//
// INTERVIEW: "I built a RAG pipeline that queries MongoDB for
// relevant hotel data based on the user's city and price context,
// then injects those results into the LLM prompt. This eliminates
// hallucination because the AI responds using real database records."

const Listing = require("../BACKEND/models/listing");

// ─── Get hotels in the same city as current hotel ───
async function getHotelsByCity(city, limit = 8) {
  // RegExp with "i" flag = case-insensitive search
  // So "goa", "Goa", "GOA" all match
  return await Listing.find({
    location: new RegExp(city, "i")
  })
    .sort({ rating: -1 })  // best rated first
    .limit(limit)
    .lean();                // .lean() returns plain JS objects (faster, less memory)
}

// ─── Get hotels in a price range ───
async function getHotelsByPriceRange(minPrice, maxPrice, limit = 5) {
  return await Listing.find({
    price: { $gte: minPrice, $lte: maxPrice }
  })
    .sort({ price: 1 })    // cheapest first
    .limit(limit)
    .lean();
}

// ─── Get all unique cities in our database ───
async function getAvailableCities() {
  // .distinct() returns unique values for a field
  return await Listing.distinct("location");
}

// ─── Format hotel data into a concise string for the LLM ───
// We keep it SHORT to save tokens (~30 tokens per hotel)
function formatHotelsForPrompt(hotels) {
  if (!hotels || hotels.length === 0) return "No hotels found.";

  return hotels.map((h, i) =>
    `${i + 1}. ${h.title} | ${h.location} | ₹${h.price}/night | ${h.rating}/5 stars | ${h.reviewCount} reviews`
  ).join("\n");
}

// ─── MAIN RAG FUNCTION: Build context for a given hotel ───
// This is called before every LLM request to inject real data
async function buildRAGContext(hotel) {
  if (!hotel) return null;
  try {
    // Get other hotels in same city for comparison
    const sameCity = await getHotelsByCity(hotel.location, 8);

    // Get available cities for itinerary suggestions
    const cities = await getAvailableCities();

    // Build a concise context string
    let context = `CURRENT HOTEL: ${currentHotel.title} | ${currentHotel.location} | ₹${currentHotel.price}/night | ${currentHotel.rating}/5\n\n`;
    context += `OTHER HOTELS IN ${currentHotel.location.toUpperCase()}:\n`;
    context += formatHotelsForPrompt(sameCity) + "\n\n";
    context += `CITIES IN OUR DATABASE: ${cities.join(", ")}`;

    return context;
  } catch (err) {
    console.error("RAG error:", err.message);
    return null; // graceful fallback — AI works without RAG, just less accurate
  }
}

module.exports = {
  getHotelsByCity,
  getHotelsByPriceRange,
  getAvailableCities,
  formatHotelsForPrompt,
  buildRAGContext
};

