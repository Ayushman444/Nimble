//npm i razorpay

//import models
const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mongoose = require("mongoose");

const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");

//create the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  // get courseID and user ID
  const { course_id } = req.body;
  const userId = req.user.id;
  //validation
  //valid courseID
  if (!course_id) {
    return res.json({
      success: false,
      message: "Please provide valid course ID",
    });
  }
  if (!userId) {
    return res.json({
      success: false,
      message: "User not found",
    });
  }
  //valid course Detail
  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      return res.json({
        success: false,
        message: "Could not find the course",
      });
    }
    //user already pay for the same course
    const uid = new mongoose.Types.ObjectId(userId); //convert string type to the object type because it is store in schema like that
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "student is already enrolled in this course",
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  //user already buy the course or not
  //create the order
  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    //return response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (e) {
    console.log(e);
    res.json({
      success: false,
      message: "could not initiate order",
    });
  }
  //return response
};


//verify signature of razorpay
exports.verifySignature = async(req,res)=>{
    // matching or server me pada hua secret and the one received from razorpay
    const webhookSecret = "12345678";
    const signature = req.headers("x-razorpay-signature");
}
