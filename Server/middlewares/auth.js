const User = require("../models/User");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator");

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


//signup
exports.signUp = async (req,res) =>{

    //STEPS TO BE PERFORMED IN THIS CONTROLLER FUNCTION
    //data fetch
    //validate
    //match passwords
    //check if user already exists
    //find most recent otp for the user
    //validate the otp


    
}
