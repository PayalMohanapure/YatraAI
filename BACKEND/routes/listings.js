const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });
const { isLoggedIn, isOwner } = require("../middleware");

// All hotel routes mapped to controller functions
router.route("/")
  .get(listingController.index)           // GET  /listings
  .post(isLoggedIn, upload.single("listing[image]"), listingController.createListing); // POST /listings

router.route("/new")
  .get(isLoggedIn, listingController.renderNewForm);  // GET  /listings/new

router.route("/:id")
  .get(listingController.showListing)     // GET  /listings/:id
  .put(isLoggedIn, isOwner, upload.single("listing[image]"), listingController.updateListing)   // PUT  /listings/:id
  .delete(isLoggedIn, isOwner, listingController.destroyListing); // DELETE /listings/:id

router.route("/:id/edit")
  .get(isLoggedIn, isOwner, listingController.renderEditForm); // GET  /listings/:id/edit

module.exports = router;

