const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const passport = require("passport");

router.route("/signup")
  .get(userController.renderSignupForm)
  .post(userController.signup);

router.route("/login")
  .get(userController.renderLoginForm)
  .post(passport.authenticate("local", { failureRedirect: "/login" }), userController.login);

router.get("/logout", userController.logout);
const { isLoggedIn } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.route("/profile")
  .get(isLoggedIn, userController.renderProfile)
  .put(isLoggedIn, upload.single("profileImage"), userController.updateProfile);

module.exports = router;
