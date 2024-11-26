const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isreviewAuthor } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const reviewController = require("../controllers/review");

// Post a review
router.post("/", isLoggedIn, wrapAsync(reviewController.createReview));

// Delete a review
router.delete("/:reviewId", isLoggedIn, isreviewAuthor, wrapAsync(reviewController.deleteReview));

// Fetch a listing with populated reviews and authors
router.get("/:listingId", wrapAsync(reviewController.getListingWithReviews));

module.exports = router;
