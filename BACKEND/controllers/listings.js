const Listing = require("../models/listing");

// GET /listings — Show all hotels with search & filter
module.exports.index = async (req, res) => {
  const { search, city, minPrice, maxPrice, rating, sort } = req.query;
  let filter = {};

  // Text search — match title or location
  if (search) {
    filter.$or = [
      { title: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
    ];
  }

  // City filter
  if (city && city !== "all") {
    filter.location = new RegExp(city, "i");
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (rating) {
    filter.rating = { $gte: Number(rating) };
  }

  // Sort option
  let sortOption = {};
  switch (sort) {
    case "price_low":  sortOption = { price: 1 };   break;
    case "price_high": sortOption = { price: -1 };   break;
    case "rating":     sortOption = { rating: -1 };  break;
    default:           sortOption = { _id: -1 };     break;
  }

  const listings = await Listing.find(filter).sort(sortOption);

  // Get unique cities for the filter dropdown
  const cities = await Listing.distinct("location");

  res.render("listings/index", { listings, cities, query: req.query });
};

// GET /listings/:id — Show one hotel detail
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    })
    .populate("owner");
  if (!listing) {
    return res.status(404).render("error", { message: "Hotel not found!" });
  }
  res.render("listings/show", { listing });
};

// GET /listings/new — Show create form
module.exports.renderNewForm = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/login");
  }
  res.render("listings/new");
};

// POST /listings — Save new hotel to DB (with Cloudinary image)
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  // If a file was uploaded via Cloudinary
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  // Set default image if none provided
  if (!newListing.image || !newListing.image.url) {
    newListing.image = {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      filename: "default",
    };
  }

  // Set owner if authenticated
  if (req.user) {
    newListing.owner = req.user._id;
  }

  await newListing.save();
  res.redirect("/listings");
};

// GET /listings/:id/edit — Show edit form
module.exports.renderEditForm = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/login");
  }
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).render("error", { message: "Hotel not found!" });
  }
  res.render("listings/edit", { listing });
};

// PUT /listings/:id — Update hotel in DB
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // If a new file was uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  res.redirect(`/listings/${id}`);
};

// DELETE /listings/:id — Delete hotel from DB
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
};
