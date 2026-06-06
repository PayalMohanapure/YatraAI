require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const data = require("./data");

const MONGODB_URL = process.env.MONGODB_URL;

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("✅ Connected to MongoDB");

    // Clear old data
    await Listing.deleteMany({});
    console.log("🗑️  Old listings deleted");

    // Insert new real hotel data
    await Listing.insertMany(data);
    console.log(`🎉 Successfully inserted ${data.length} real hotels into MongoDB!`);

  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed.");
  }
}

seedDatabase();
