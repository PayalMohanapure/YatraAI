<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
</div>

<h1 align="center">YatraAI 🇮🇳✈️</h1>

<p align="center">
  <strong>Discover India's finest hotels with an embedded AI Travel Concierge.</strong><br>
  <a href="https://yatraai-ihpw.onrender.com">View Live Demo</a>
</p>

---

## 📸 Platform Preview

> **Note to Developer:** *Place your high-resolution screenshots in a `docs/` folder and replace these placeholder paths.*

| Homepage & Search | AI Travel Concierge |
| :---: | :---: |
| ![Homepage](docs/homepage-screenshot.png) | ![AI Chatbot](docs/ai-screenshot.png) |
| *Modern Glassmorphism UI & Advanced Filters* | *Context-aware trip planning & local guide* |

---

## ✨ Features

- **🤖 Conversational AI Concierge:** Integrated OpenAI assistant capable of generating day-by-day itineraries, budget estimates, and local restaurant recommendations.
- **🗺️ Interactive Maps:** Real-time location tracking and routing using the Leaflet Geolocation API.
- **🔐 Secure Authentication:** Robust user authentication (Signup/Login) with Passport.js and secure session storage.
- **☁️ Cloud Image Hosting:** Seamless property image uploads managed via Cloudinary integration.
- **🎨 Premium UI/UX:** Responsive, modern interface featuring glassmorphism, dynamic flash toasts, and a mobile-first design.

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** Passport.js, Express-Session
- **File Uploads:** Multer, Cloudinary

### Frontend
- **Templating:** EJS (Embedded JavaScript), EJS-Mate
- **Styling:** Custom CSS (CSS Variables, Flexbox, CSS Grid)
- **Maps:** Leaflet.js

### AI Integration
- **LLM:** OpenAI API (GPT-4 / GPT-3.5)
- **Architecture:** RAG (Retrieval-Augmented Generation) passing MongoDB context directly into the AI prompts.

---

## 🚀 Local Installation

Follow these steps to run YatraAI on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/PayalMohanapure/YatraAI.git
cd YatraAI
```

### 2. Install dependencies
Navigate to the backend directory and install all required NPM packages:
```bash
cd BACKEND
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `BACKEND` directory and add your secret keys. **Never commit this file to GitHub.**
```env
PORT=8080
MONGODB_URL=your_mongodb_connection_string
SECRET=your_express_session_secret
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
OPENAI_API_KEY=your_openai_api_key
```

### 4. Seed the Database (Optional)
If you want to populate the database with sample hotels:
```bash
node init/index.js
```

### 5. Run the Server
```bash
node app.js
```
The application will be running at `http://localhost:8080`.

---

## 📂 Project Structure

```text
YatraAI/
├── AGENTIC_AI/         # OpenAI integration, Orchestrator, & RAG logic
├── BACKEND/            
│   ├── controllers/    # Route logic (MVC Pattern)
│   ├── models/         # MongoDB Schemas (Listings, Users, Reviews)
│   ├── routes/         # Express routing definitions
│   ├── app.js          # Main server entry point
│   └── package.json
└── FRONTEND/
    ├── public/         # Static assets (CSS, Client-side JS)
    └── views/          # EJS Templates (Layouts, Pages, Components)
```

---

<div align="center">
  <i>Built with ❤️ for seamless travel planning across India.</i>
</div>
