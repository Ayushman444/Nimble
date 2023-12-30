const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
  },
  age: {
    type: Number,
    trim: true,
  },
  dataOfBirth: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: Number,
    trim: true,
  },
});

//model name and schema name
module.exports = mongoose.model("Profile", profileSchema);
