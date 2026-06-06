// ─── map.js — Leaflet map with current location + route to hotel ───
//
// FEATURES:
// 1. Shows hotel location with a purple marker
// 2. Detects user's current GPS location (browser Geolocation API)
// 3. Shows green marker at user's location
// 4. Draws a dashed line from user → hotel
// 5. Shows distance in km
//
// INTERVIEW: "I used the browser's Geolocation API to get the user's
// real-time GPS coordinates, then drew a polyline route from their
// location to the hotel. The map auto-fits both markers in view."

// Hotel coordinates from show.ejs
const hotelLat = listingCoords[1];
const hotelLng = listingCoords[0];

// Initialize map centered on hotel
const map = L.map("map").setView([hotelLat, hotelLng], 14);

// OpenStreetMap tiles (100% free)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
}).addTo(map);

// ─── Custom icons ───
const hotelIcon = L.divIcon({
  className: "custom-marker",
  html: '<div style="background: #7c3aed; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; box-shadow: 0 2px 8px rgba(124,58,237,0.4); border: 3px solid white;"><i class="fa-solid fa-hotel"></i></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});

const userIcon = L.divIcon({
  className: "custom-marker",
  html: '<div style="background: #10b981; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; box-shadow: 0 2px 8px rgba(16,185,129,0.4); border: 3px solid white;"><i class="fa-solid fa-user"></i></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

// ─── Hotel marker ───
const hotelMarker = L.marker([hotelLat, hotelLng], { icon: hotelIcon }).addTo(map);
hotelMarker.bindPopup(
  `<div style="font-family: 'Outfit', sans-serif; padding: 6px;">
    <strong style="font-size: 14px;">${listingTitle}</strong><br/>
    <span style="color:#7c3aed; font-weight:600;">₹${listingPrice.toLocaleString("en-IN")}/night</span>
  </div>`
).openPopup();

// ─── Calculate distance between two points (Haversine formula) ───
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

// ─── Try to get user's current location ───
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // User marker
      const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
      const distance = getDistanceKm(userLat, userLng, hotelLat, hotelLng);

      userMarker.bindPopup(
        `<div style="font-family: 'Outfit', sans-serif; padding: 6px;">
          <strong>📍 You are here</strong><br/>
          <span style="color:#10b981;">${distance} km from hotel</span>
        </div>`
      );

      // Draw dashed line from user → hotel
      const routeLine = L.polyline(
        [[userLat, userLng], [hotelLat, hotelLng]],
        {
          color: "#7c3aed",
          weight: 3,
          dashArray: "8, 8",
          opacity: 0.7
        }
      ).addTo(map);

      // Auto-fit map to show both markers
      const bounds = L.latLngBounds(
        [userLat, userLng],
        [hotelLat, hotelLng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    },
    (err) => {
      // User denied location — that's fine, just show hotel
      console.log("📍 Location access denied — showing hotel only");
    }
  );
}
