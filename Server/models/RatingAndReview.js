const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectID,
    required: true,
    ref: "User",
  },
  rating: {
    type: mongoose.Schema.Types.ObjectTD,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
