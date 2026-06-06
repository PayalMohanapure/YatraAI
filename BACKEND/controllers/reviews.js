const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    
    // Update listing rating automatically based on average
    await newReview.save();
    
    // Recalculate rating
    const populatedListing = await Listing.findById(req.params.id).populate("reviews");
    const totalRating = populatedListing.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    listing.rating = (totalRating / populatedListing.reviews.length).toFixed(1);
    listing.reviewCount = populatedListing.reviews.length;
    
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    // Recalculate rating
    const listing = await Listing.findById(id).populate("reviews");
    if(listing.reviews.length > 0) {
        const totalRating = listing.reviews.reduce((sum, rev) => sum + rev.rating, 0);
        listing.rating = (totalRating / listing.reviews.length).toFixed(1);
        listing.reviewCount = listing.reviews.length;
    } else {
        listing.rating = 0;
        listing.reviewCount = 0;
    }
    await listing.save();

    res.redirect(`/listings/${id}`);
};
