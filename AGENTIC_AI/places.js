// ─── places.js — Real Place Data via Google Maps on RapidAPI ───
//
// Fetches REAL nearby restaurants, attractions, temples from Google Maps API
// through RapidAPI, using the hotel's GPS coordinates.
// This eliminates hallucination — the AI gets verified place data.

require("dotenv").config({ path: require("path").join(__dirname, "../BACKEND/.env") });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "google-map-places.p.rapidapi.com";

// ─── Fetch nearby places by type ───
async function fetchNearbyPlaces(lat, lng, type = "restaurant", radius = 2000) {
  try {
    const url = `https://${RAPIDAPI_HOST}/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&language=en`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      console.log(`⚠️ Places API returned ${response.status} — using AI knowledge instead`);
      return [];
    }

    const data = await response.json();
    return (data.results || []).slice(0, 6); // Top 6 results
  } catch (err) {
    console.log("⚠️ Places API unavailable — using AI knowledge instead");
    return [];
  }
}

// ─── Format places into a concise string for LLM prompt ───
function formatPlacesForPrompt(places, label) {
  if (!places || places.length === 0) return "";

  let text = `\n${label}:\n`;
  places.forEach((p, i) => {
    const rating = p.rating ? `${p.rating}/5` : "N/A";
    const totalRatings = p.user_ratings_total || 0;
    const open = p.opening_hours?.open_now ? "Open Now" : "Check Hours";
    const address = p.vicinity || "";
    text += `${i + 1}. ${p.name} | Rating: ${rating} (${totalRatings} reviews) | ${open} | ${address}\n`;
  });
  return text;
}

// ─── Main function: Get all nearby place data for a hotel ───
async function getNearbyPlacesContext(lat, lng) {
  // Fetch restaurants, tourist attractions, and temples in parallel
  const [restaurants, attractions, temples] = await Promise.all([
    fetchNearbyPlaces(lat, lng, "restaurant", 2000),
    fetchNearbyPlaces(lat, lng, "tourist_attraction", 3000),
    fetchNearbyPlaces(lat, lng, "hindu_temple", 3000),
  ]);

  let context = "";
  context += formatPlacesForPrompt(restaurants, "REAL VERIFIED RESTAURANTS NEARBY");
  context += formatPlacesForPrompt(attractions, "REAL VERIFIED ATTRACTIONS NEARBY");
  context += formatPlacesForPrompt(temples, "REAL VERIFIED TEMPLES NEARBY");

  if (!context) {
    return null; // Graceful fallback
  }

  return context;
}

module.exports = { fetchNearbyPlaces, formatPlacesForPrompt, getNearbyPlacesContext };
