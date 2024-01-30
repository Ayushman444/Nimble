const Course = require("../models/Course");
const Tag = require("../models/Tag");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create course handler function
exports.createCourse = async (req, res) => {
  try {
    //data fetch and file fetch
    //validation - data , instructor , tag
    //upload to cloudinary , store secure url
    //course create
    //add course entry in user schema(in this case instructor is the user - uske banaye hue courses dikhenge)
    // add course entry in the tag
    // return response

    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    const thumbnail = req.files.thumbnailImage;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //storing the instructor id in course
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details:", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found in db",
      });
    }

    //check given tag is valid or not (postman)

    const tagDetails = Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag details not found in db",
      });
    }

    //upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create an entry for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatWillYouLearn: whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //update the intructor's course list
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    //update the tag schema
    // await Tag.findByIdAndUpdate(
    //     {_id : tagDetails._id},
    //     {
    //         $push:{
    //             courses:
    //         }
    //     }
    // )

    //return response
    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Failed to create course entry",
      error: error.message,
    });
  }
};

//getAllcourse handler function
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({});

    return res.status(200).json({
      success: true,
      message: "Data for all courses fetched successfully",
      data: allCourses,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
        success:false,
        message:'Cannot Fetch course data',
        error:error.message;
    })
  }
};
