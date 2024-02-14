const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
//reset Password Token mail sender
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from the request body
    const email = req.body.email;
    //check user exists or not, email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "Your email is not registered with us",
      });
    }
    //generate token
    const token = crypto.randomUUID();
    //update user by adding token and expire time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    //generate frontend link for password reset
    const url = `http://localhost:3000/update-password/${token}`;

    //send mail containing url
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link : ${url} `
    );

    //return response
    return res.json({
      success: true,
      message:
        "Email sent successfully, please check email and change password.",
        token,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the reset password mail",
    });
  }
};

//reset Password Update in DB
exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body; //frontend sent the token in body already

    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password is not matching with confirm password.",
      });
    }
    //get userDetails from db using token
    const userDetails = await User.findOne({ token: token });
    //if no entry then invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is invalid",
      });
    }
    //if token time expired check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Reset password link has expired",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //update the password
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    //return response
    return res.status(200).json({
      success: true,
      message: "Reset password successfull",
    });
  } catch (e) {
      console.log(e);
      return res.status(500).json({
        success:false,
        message:"Cannot change the password , something went wrong in reset password controller , please try again."
      })
  }
};
