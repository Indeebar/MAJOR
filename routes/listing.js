const express = require("express");
const router = express.Router();
const Listing = require('../models/listing'); 
const { isLoggedIn, isOwner } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listing.js");

const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

// Assuming you have a Listing model


// Routes for creating a new listing
router
    .route("/new")
    .get(isLoggedIn, listingController.renderNewForm);

// Routes for all listings
router
    .route("/")
    .get(wrapAsync(listingController.getAllListings))
    .post(isLoggedIn, upload.single("listing[image]"), wrapAsync(listingController.createListing));

// Routes for a specific listing (show, update, delete)
router
    .route("/:id")
    .get(wrapAsync(listingController.getListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Route for editing a specific listing
router
    .route("/:id/edit")
    .get(isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Route to handle search
router
    .route("/search")
    .get(wrapAsync(listingController.searchListings)); // Route for searching listings






// Search route
router.get("/search", async (req, res) => {
    const { query } = req.query;
  
    try {
      // Validate query
      if (!query || query.trim() === "") {
        req.flash("error", "Search query cannot be empty.");
        return res.redirect("/listings");
      }
  
      // Search listings by title or country (case-insensitive)
      const listings = await Listing.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { country: { $regex: query, $options: "i" } },
        ],
      });
  
      // Handle no results
      if (listings.length === 0) {
        req.flash("error", "No listings match your search.");
        return res.redirect("/listings");
      }
  
      // Render results
      res.render("listings/index", { allListings: listings });
    } catch (err) {
      console.error(err);
      req.flash("error", "Something went wrong.");
      res.redirect("/listings");
    }
  });

  
module.exports = router;










