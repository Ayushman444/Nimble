const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
  },
  subSection: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubSection",
  }],
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
});

//model name and schema name
module.exports = mongoose.model("Section", sectionSchema);
