const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

//a function -> to send emails
//written after the schema and before the model 

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification email from Nimble",
      otp
    );
    console.log("Email Sent Successfully: ", mailResponse);
  } catch (error) {
    console.log("error occurred while sending mail: ", error);
    throw error;
  }
}

//its a pre-save middleware
OTPSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("Otp", OTPSchema);
