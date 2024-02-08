const express = require("express")
const router = express.Router()


// Routes for deleteprofile , updateprofile ,getuserdetails , getEnrolledCourse , updateDisplayPicture;

const { auth, isInstructor } = require("../middlewares/auth")
const {deleteAccount, updateProfile, getAllUserDetails, updateDisplayPicture,  getEnrolledCourses, instructorDashboard} = require("../controllers/Profile")
   
router.get("/getEnrolledCourses", auth, getEnrolledCourses)//Get enrolled courses
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)
router.delete("/deleteProfile", auth, deleteAccount) //delete user account
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)


module.exports = router