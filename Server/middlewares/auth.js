const User = require("../models/User");
const OTP = require("../models/Otp");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//send OTP
exports.sendOTP = async (req, res) => {
  try {
    //fetch the email
    const { email } = req.body;

    //check that user already exists or not
    const checkUserPresent = await User.findOne({ email });

    //if exists
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message:
          "User account already registered, create new account with new email or login with existing account.",
      });
    }

    //generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // make sure the otp is unique
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayLoad = { email, otp };

    //create an entry for OTP
    const otpBody = await OTP.create(otpPayLoad);
    console.log(otpBody);

    //return response successful
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: e.message,
    });
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

    if (!password !== confirmPassword) {
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
        success:true,
        message:'User is registered Successfully',
        user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
        success:false,
        message:"User cannot be registered. Please try again"
    })
  }
};


//login controller

exports.login = async (req,res) =>{
  try{
    //get data from the req body
    const {email, password} = req.body;
    //validation of data
    if(!email || !password){
      return res.status(403).json({
        success:false,
        message: "All fields are required, please try again."
      })
    }
    //user registered or not 
    const user = await User.findOne({email}).populate("additionalDetails");
    if(!user){
      return res.status(401).json({
        success:false,
        message:"User is not registered , please signup first",
      })
    }
    //token jwt token , after password matching
    if(await bcrypt.compare(password, user.password)){
      const payload = {
        email: user.email,
        id: user._id,
        role: user.role,
      }
      const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:"2h",
      })
      user.token = token;
      user.password = undefined;

      //create cookie and send the response
      const options = {
        expires: new Date(Date.now() + 3*24*60*60*1000),
        httpOnly:true,
      }
      res.cookie("token",token,options).status(200).json({
        success:true,
        token,
        user,
        message:'Logged in successfully',
      })
    }else{
      return res.status(401).json({
        success:false,
        message:'Password is incorrect'
      })
    }
  }catch(e){
    console.log(e);
    return res.status(500).json({
      success:false,
      message: 'Login failure please try again'
    })
  }
}