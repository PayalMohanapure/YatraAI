const OpenAI = require("openai");
require("dotenv").config({ path: require("path").join(__dirname, "../BACKEND/.env") });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 800;
module.exports = { client, MODEL, MAX_TOKENS };