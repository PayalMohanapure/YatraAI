require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const cities = [
  { name: "Goa",       country: "India", tier: "high"    },
  { name: "Jaipur",    country: "India", tier: "high"    },
  { name: "Manali",    country: "India", tier: "mid"     },
  { name: "Rishikesh", country: "India", tier: "mid"     },
  { name: "Udaipur",   country: "India", tier: "high"    },
  { name: "Munnar",    country: "India", tier: "mid"     },
  { name: "Shimla",    country: "India", tier: "mid"     },
  { name: "Varanasi",  country: "India", tier: "mid"     },
  { name: "Agra",      country: "India", tier: "high"    },
  { name: "Mumbai",    country: "India", tier: "luxury"  },
];

function getDates() {
  const today = new Date();
  const checkIn  = new Date(today); checkIn.setDate(today.getDate() + 1);
  const checkOut = new Date(today); checkOut.setDate(today.getDate() + 2);
  const fmt = (d) => d.toISOString().split("T")[0];
  return { checkIn: fmt(checkIn), checkOut: fmt(checkOut) };
}

async function searchDestinationId(cityName) {
  const url = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(cityName + " India")}`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "booking-com15.p.rapidapi.com",
    },
  });
  const data = await res.json();
  if (data?.data?.length > 0) {
    const dest = data.data.find(d => d.search_type === "city") || data.data[0];
    console.log(`   📍 Found dest_id for ${cityName}: ${dest.dest_id}`);
    return dest.dest_id;
  }
  return null;
}

async function fetchHotelsForCity(city) {
  try {
    console.log(`🔍 Fetching hotels for ${city.name}...`);

    const destId = await searchDestinationId(city.name);
    if (!destId) {
      console.log(`   ⚠️  Could not find destination ID for ${city.name}`);
      return [];
    }

    const { checkIn, checkOut } = getDates();

    const url = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id=${destId}&search_type=city&arrival_date=${checkIn}&departure_date=${checkOut}&adults=2&children_age=0%2C17&room_qty=1&page_number=1&languagecode=en-us&currency_code=INR`;

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    });

    const data = await res.json();

    if (!data?.data?.hotels) {
      console.log(`   ⚠️  No hotels found for ${city.name}`, JSON.stringify(data).slice(0, 300));
      return [];
    }

    const hotels = data.data.hotels.slice(0, 8).map((hotel, index) => {
      const info = hotel.property;
      return {
        title: info.name,
        description: `Experience the beauty of ${city.name} at ${info.name}. A premium stay with world-class amenities and breathtaking local experiences.`,
        image: {
          url: info.photoUrls?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          filename: `hotel-${city.name.toLowerCase()}-${index}`,
        },
        price: Math.round(info.priceBreakdown?.grossPrice?.value || 3000),
        location: city.name,
        country: city.country,
        starRating: info.propertyClass || 3,
        rating: info.reviewScore ? parseFloat((info.reviewScore / 2).toFixed(1)) : 4.0,
        reviewCount: info.reviewCount || 100,
        geometry: {
          type: "Point",
          coordinates: [info.longitude, info.latitude],
        },
      };
    });

    console.log(`   ✅ Found ${hotels.length} real hotels in ${city.name}`);
    return hotels;

  } catch (err) {
    console.error(`❌ Error fetching ${city.name}:`, err.message);
    return [];
  }
}

async function fetchWithRetry(city) {
  let result = await fetchHotelsForCity(city);
  if (result.length === 0) {
    console.log(`   ⏳ Retrying ${city.name} in 10 seconds...`);
    await new Promise((r) => setTimeout(r, 10000));
    result = await fetchHotelsForCity(city);
  }
  return result;
}

async function main() {
  if (!RAPIDAPI_KEY) {
    console.error("❌ RAPIDAPI_KEY not found! Create a .env file with: RAPIDAPI_KEY=your_key_here");
    process.exit(1);
  }

  console.log("🚀 Starting real hotel data fetch from Booking.com API...\n");
  let allListings = [];

  for (const city of cities) {
    const hotels = await fetchWithRetry(city);
    allListings = allListings.concat(hotels);
    console.log(`   ⏱️  Waiting 3 seconds before next city...\n`);
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\n🎉 Total real hotels fetched: ${allListings.length}`);

  const outputPath = path.join(__dirname, "../init/data.js");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `module.exports = ${JSON.stringify(allListings, null, 2)};\n`);
  console.log(`✅ Data saved to init/data.js successfully!`);
}

main();