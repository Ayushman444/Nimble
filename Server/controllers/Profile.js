const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    //get data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    //get userID
    const id = req.user.id;
    //validation
    if (!id || !contactNumber || !gender) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required fields",
        });
    }
    //find profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    //update profile
    profileDetails.dataOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    //update profile
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profileDetails,
    });
    //return response
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Some error occured in update Profile controller",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    //get id
    const id = req.user.id;

    //validation
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res
        .status(404)
        .josn({ success: false, message: "User not found" });
    }
    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //TODO : HW un enroll user from all enrolled courses
    //delete user
    await User.findByIdAndDelete({ _id: id });

    //return response
    return res.status(200).json({
        success:true,
        message:"Account deleted successfully"
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Some error occured in delete account controller",
    });
  }
};

exports.getAllUserDetails = async(req,res)=>{
    try{
        //get id
        const id = req.user.id;
        //validation
        //user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec()
        //return res
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({ _id: userId, })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec() 
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for(var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for(var j = 0; j < userDetails.courses[i].courseContent.length; j++){
          totalDurationInSeconds += userDetails.courses[i].courseContent[j].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds)
          SubsectionLength +=  userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({courseID: userDetails.courses[i]._id,  userId: userId,})
      courseProgressCount = courseProgressCount?.completedVideos.length
      if(SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } 
      else {                                             // To make it up to 2 decimal point 
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =  Math.round( (courseProgressCount / SubsectionLength) * 100 * multiplier ) / multiplier
      }
    }

    if(!userDetails) {
       return res.status(400).json({success: false,  message: `Could not find user with id: ${userDetails}`,})
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } 
  catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course?.studentsEnrolled?.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,                               // Include other course properties as needed
        totalAmountGenerated,
      }
      return courseDataWithStats
    })

     res.status(200).json({
        courses: courseData,
      })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(displayPicture,  process.env.FOLDER_NAME,  1000,  1000 )
       
    const updatedProfile = await User.findByIdAndUpdate({ _id: userId }, { image: image.secure_url },  { new: true })
     
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } 
  catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}