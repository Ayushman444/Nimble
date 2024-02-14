const User = require("../models/User");
const OTP = require("../models/Otp");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();

//send OTP
exports.sendOTP = async (req, res) =>  {

  try {
      const {email} = req.body;                                     //fetch email from request ki body
      const checkUserPresent = await User.findOne({email});        //check if user already exist

      if(checkUserPresent) {                                      //if user already exist , then return a response
          return res.status(401).json({
              success:false,
              message:'User already registered',
          })
      }

      var otp = otpGenerator.generate(6, {                       //generate otp of 6 digit number donot contain uppercase,lowercase,specialchar; 
          upperCaseAlphabets:false,
          lowerCaseAlphabets:false,
          specialChars:false,
      });
      console.log("OTP generated: ", otp );

      let result = await OTP.findOne({otp: otp});               //check unique otp or not
      while(result){                                            // if result is true so we regenerate otp;
          otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
    });
      }

      const otpPayload = {email, otp};

      //create an entry in OTP in DB and this OTP is used in SignUp to find response;
      const otpBody = await OTP.create(otpPayload);
      console.log("OTP Body", otpBody);

      res.status(200).json({                                     //return response successful
          success:true,
          message:'OTP Sent Successfully',
          otp,
      })
  }
  catch(error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:error.message,
      })
  }

};


//signup controller
exports.signUp = async (req, res) => {
  //STEPS TO BE PERFORMED IN THIS CONTROLLER FUNCTION
  //data fetch
  //validate
  //match passwords
  //check if user already exists
  //find most recent otp for the user
  //validate the otp

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !confirmPassword ||
      !password ||
      !email ||
      !contactNumber ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Psw and confirm Psw do not match.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    const recentOtp = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);

    if (recentOtp.length == 0) {
      //OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP found",
      });
    } else if (otp !== recentOtp.otp) {
      //wrong otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    //entry create in db

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
   
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "User is registered Successfully",
      user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

//login controller

exports.login = async (req, res) => {
  try {
    //get data from the req body
    const { email, password } = req.body;
    //validation of data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required, please try again.",
      });
    }
    //user registered or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered , please signup first",
      });
    }
    //token jwt token , after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      //create cookie and send the response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Login failure please try again",
    });
  }
};

//changePassword
exports.changePassword = async (req, res) => {
  //get data from req body
  //get oldPassword, newPassword, confirmNewPassword
  //validation

  //update pwd in the database
  //send mail - password updated
  //return response
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Login again",
      });
    }
    const userDetails = await User.findById(userId);
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: " The password and confirm Password did not match.",
      });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      userId,
      { password: encryptedPassword },
      { new: true }
    );
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully: ", emailResponse.response);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending mail for change pswd",
        error: error.message,
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while changing password",
      error: error.message,
    });
  }
};
