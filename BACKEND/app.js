require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const listingRouter = require("./routes/listings");
const aiRouter = require("./routes/ai");
const userRouter = require("./routes/users");
const reviewRouter = require("./routes/reviews");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");


const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URL = process.env.MONGODB_URL;

// ─── Connect to MongoDB ───────────────────────────────────────
mongoose.connect(MONGODB_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ─── View Engine Setup ────────────────────────────────────────
app.engine("ejs", ejsMate);           // use ejs-mate for layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../FRONTEND/views"));

// ─── Middleware ───────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));  // parse form data
app.use(express.json());                           // parse JSON data
app.use(methodOverride("_method"));               // allow PUT & DELETE from forms
app.use(express.static(path.join(__dirname, "../FRONTEND/public"))); // serve CSS/JS

const store = MongoStore.create({
    mongoUrl: MONGODB_URL,
    crypto: {
        secret: process.env.SECRET || "thisshouldbeabettersecret!"
    },
    touchAfter: 24 * 3600 // time period in seconds
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE");
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// ─── Routes ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use("/", userRouter);
app.use("/api", aiRouter);
app.get("/about", (req, res) => res.render("pages/about"));
app.get("/contact", (req, res) => res.render("pages/contact"));

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("error", { message });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
