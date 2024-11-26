const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

// Controller to render the new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Controller to create a new listing
module.exports.createListing = async (req, res, next) => {
    const { price } = req.body.listing;

    // Validate price input
    if (isNaN(price)) throw new ExpressError(400, "Price must be a number");

    // Create a new listing with form data
    const newListing = new Listing({
        ...req.body.listing,
        owner: req.user._id, // Set the owner from the session
        image: {
            url: req.file ? req.file.path : "uploads/default-image.jpg",
            filename: req.file ? req.file.filename : "default.jpg",
        },
    });

    // Save the new listing to the database
    await newListing.save();

    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

// Controller to list all listings
module.exports.getAllListings = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// Controller to show a specific listing
module.exports.getListing = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// Controller to render the edit form
module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
};

// Controller to update a listing
module.exports.updateListing = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const { title, description, price, location, country } = req.body.listing;

    // Update listing details
    listing.title = title;
    listing.description = description;
    listing.price = price;
    listing.location = location;
    listing.country = country;

    // Handle image update if a new file is provided
    if (req.file) {
        listing.image.url = req.file.path;
        listing.image.filename = req.file.filename;
    }

    await listing.save();
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

// Controller to delete a listing
module.exports.deleteListing = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID");
        return res.redirect("/listings");
    }

    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};


// Controller to search listings by title or country
module.exports.searchListings = async (req, res) => {
    const { query } = req.query; // Get the search term from query params
    let searchQuery = {};

    if (query) {
        // Create a search query to filter by title or country (case insensitive)
        searchQuery = {
            $or: [
                { title: { $regex: query, $options: 'i' } },  // Case insensitive search for title
                { country: { $regex: query, $options: 'i' } } // Case insensitive search for country
            ]
        };
    }

    // Find the listings based on search query
    const allListings = await Listing.find(searchQuery);
    
    // Render the listings index page with the filtered results
    res.render("listings/index.ejs", { allListings });
};

