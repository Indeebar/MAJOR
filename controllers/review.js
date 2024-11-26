const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

// Controller for posting a review
module.exports.createReview = async (req, res) => {
    const { listingId } = req.params;

    // Find the listing to associate the review with
    const listing = await Listing.findById(listingId);
    if (!listing) throw new ExpressError(404, "Listing not found");

    // Create a new review and associate it with the logged-in user
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id; // Set the author to the logged-in user
    listing.reviews.push(newReview); // Add the review to the listing's reviews array

    await newReview.save();
    await listing.save();

    req.flash("success", "New review created successfully.");
    res.redirect(`/listings/${listing._id}`);
};

// Controller for deleting a review
module.exports.deleteReview = async (req, res) => {
    const { listingId, reviewId } = req.params;

    // Find and delete the review
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found or already deleted.");
        return res.redirect(`/listings/${listingId}`);
    }

    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(
        listingId,
        { $pull: { reviews: reviewId } }, // Remove the review ID from the reviews array
        { new: true }
    );

    req.flash("success", "Review deleted successfully.");
    res.redirect(`/listings/${listingId}`);
};

// Controller for fetching a listing with populated reviews and authors
module.exports.getListingWithReviews = async (req, res) => {
    const { listingId } = req.params;

    // Find the listing and populate its reviews and their authors
    const listing = await Listing.findById(listingId)
        .populate({
            path: "reviews",
            populate: { path: "author" }, // Populate the author of each review
        });

    if (!listing) throw new ExpressError(404, "Listing not found");

    res.render("listings/show", { listing }); // Adjust the render method based on your view setup
};
