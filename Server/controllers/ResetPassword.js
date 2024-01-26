const User = require("../models/User");
const mailSender = require("../utils/mailSender");

//reset Password Token
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
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
        success:false,
        message:"Something went wrong while sending the reset password mail"
    })
  }
};

//reset Password Update in DB
