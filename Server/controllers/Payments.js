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
const {paymentSuccessEmail}= require("../mail/templates/paymentSuccessfulEmail")
const crypto = require("crypto")
const CourseProgress = require("../models/CourseProgress")

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
      // ye aage kam ayega
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

//verify signature of razorpay and authorize the payment
exports.verifySignature = async (req, res) => {
  // matching or server me pada hua secret and the one received from razorpay
  const webhookSecret = "12345678"; //from the server

  const signature = req.headers("x-razorpay-signature"); //from the razorpay hashed key is received which cannot be reverted to original key

  //now we will hash our server stored key and then we will match using crypto which is builtin

  //hashing(once encrypted cannot be reverted) - hmac( we tell hashing algo and secret key) or sha(no secret key is used)
  //HW- what is checkSum?

  const shasum = crypto.createHmac("sha256", webhookSecret);
  //convert to string
  shasum.update(JSON.stringify(req.body));
  //after hashing we get op is called digest

  const digest = shasum.digest("hex");

  if (signature == digest) {
    console.log("payment is authorized");

    const { courseId, userId } = req.body.payload.payment.entity.notes;
    try {
      //action
      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not found",
        });
      }
      console.log(enrolledCourse);

      //find student and add the course in it
      const enrolledStudent = await User.findOneAndUpdate(
        { _is: user },
        { $push: courses },
        { new: true }
      );
      console.log(enrolledStudent);

      //time to send the confirmation mail using mailsender
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations from codehelp",
        "Congratulations you are onboarded into new CodeHelp Course"
      );
      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "Signature verified and Course added",
      });
    } catch (e) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Signature not verified",
    });
  }
};

//its time for action - bachche ko course me enroll karado paise mil gye h
//user me course or course me user

exports.enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Please Provide data for Courses or UserId",
      });
  }

  for (const courseId of courses) {
    try {
      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, message: "Course not Found" });
      }
      // created courseProgress for enrolled Courses in DB;
      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });

      //find the student and add the course to their list of enrolledCOurses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        { $push: { courses: courseId, courseProgress: courseProgress._id } },
        { new: true }
      );

      ///Send mail to the Student;
      const emailResponse = await mailSender(
        enrollStudents.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName}`
        )
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the fields" });
  }

  try {
    //student ko dhundo
    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent.email,
      `Payment Recieved`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not send email" });
  }
};
