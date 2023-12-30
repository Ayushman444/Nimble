const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  },
  additionalDetails: {
    //reference
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    //Model Name is Profile
    ref: "Profile",
  },
  courses: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course,",
  },
  image: {
    //URL is in form of String
    type: String,
    required: true,
  },
  courseProgress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseProgress",
  },
});

//model name and schema name
module.exports = mongoose.model("User",userSchema)