const express = require("express")
const router = express.Router()

//Route for :- createCourse , Section(add, update, delete) , Subsection(add, update, delete), getAllCourses, getCoursesDetails;
//Route for :- createCategory , showAllCategories , getCategoryPageDetails
//Route for :-  createRating , getAverageRating , getReviews
//Route for :- updateCourseProgress

const {createCourse,  showAllCourses,  getCourseDetails,  getFullCourseDetails, editCourse, getInstructorCourses,  deleteCourse,} = require("../controllers/Course")// Course Controllers Import
const {showAllCategories, createCategory, categoryPageDetails, } = require("../controllers/Category")      // Categories Controllers Import
const {createSection,  updateSection,  deleteSection, } = require("../controllers/Section")                // Sections Controllers Import
const {createSubsection, updateSubSection,  deleteSubSection, } = require("../controllers/Subsection")     // Sub-Sections Controllers Import
const {createRating,  getAverageRating, getAllRating, } = require("../controllers/RatingAndReview")        // Rating Controllers Import
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")                          // Importing Middlewares
const {updateCourseProgress } = require("../controllers/courseProgress");

//Course routes(only by instructors)
router.post("/createCourse", auth, isInstructor, createCourse)                            // Courses can Only be Created by Instructors
router.post("/addSection", auth, isInstructor, createSection)                            //Add a Section to a Course
router.post("/updateSection", auth, isInstructor, updateSection)                         // Update a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)                         // Delete a Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)                   // Edit Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
router.post("/addSubSection", auth, isInstructor, createSubsection)
router.get("/getAllCourses", showAllCourses)                                               // Get all Registered Courses
router.post("/getCourseDetails", getCourseDetails)                                        // Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
router.post("/editCourse", auth, isInstructor, editCourse)                              // Edit Course routes
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)           // Get all Courses Under a Specific Instructor
router.delete("/deleteCourse", deleteCourse)                                            // Delete a Course
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// category routes(only by admin)
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

// Rating and Review (only by students)
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)


module.exports = router