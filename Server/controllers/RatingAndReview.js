const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

exports.createRating = async (req, res) => {
  try {
    //get user ID
    const UserId = req.user.id;

    //fetch data from req body
    const { rating, review, courseId } = req.body();

    //check if student is enrolled
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: UserId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }
    //check that the user has not already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: UserId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by the user",
      });
    }
    //create the rating and review
    const ratingReview = await RatingAndReview.create({
      user: UserId,
      rating,
      review,
      user: UserId,
    });
    //course wale schema me update kardo
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);
    //return response
    return res.status(200).json({
      success: true,
      message: "Rating and Review done successfully ",
      ratingReview,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Some error in createRating controller",
    });
  }
};

//aggregation of rating
//get average rating
exports.getAverageRating = async (req, res) => {
  try {
    //get Course ID
    const courseId = req.body.courseId;
    //calculate average rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId), // course id was string , so we converted it to match
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }, // syntax for average rating // return an array
        },
      },
    ]);
    //return rating
    if(result.length>0){
        return res.status(200).json({
            success: true,
            message: "Average rating calculated successfully",
            averageRating:result[0].averageRating,
          });
    }else{
        //if not rating review exist
        return res.status(200).json({
            success:true,
            message:'Average rating is 0 , no ratings till now',
            averageRating:0,
        })
    }
    
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
