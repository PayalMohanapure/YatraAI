const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviews");
const { isLoggedIn, isReviewAuthor } = require("../middleware");

// POST /listings/:id/reviews
router.post("/", isLoggedIn, reviewController.createReview);

// DELETE /listings/:id/reviews/:reviewId
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, reviewController.destroyReview);

module.exports = router;
