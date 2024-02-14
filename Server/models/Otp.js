// const mongoose = require("mongoose");
// const mailSender = require("../utils/mailSender");

// const OTPSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//   },
//   otp: {
//     type: String,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now(),
//     expires: 5 * 60,
//   },
// });

// //a function -> to send emails
// //written after the schema and before the model 

// async function sendVerificationEmail(email, otp) {
//   try {
//     const mailResponse = await mailSender(
//       email,
//       "Verification email from Nimble",
//       otp
//     );
//     console.log("Email Sent Successfully: ", mailResponse);
//   } catch (error) {
//     console.log("error occurred while sending mail: ", error);
//     throw error;
//   }
// }

// //its a pre-save middleware
// OTPSchema.pre("save", async function (next) {
//   await sendVerificationEmail(this.email, this.otp);
//   next();
// });

// module.exports = mongoose.model("OTP", OTPSchema);


const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");


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
		default: Date.now,
		expires: 60 * 5,                    // The document will be automatically deleted after 5 minutes of its creation time
	},
});


//a function -> to send emails of otp by using nodejs module "nodemailer" which was created in "/utils/mailSender"
async function sendVerificationEmail(email, otp) {
    try{
        const mailResponse = await mailSender(email, "Verification Email from Nimble", emailTemplate.otpTemplate(otp));
        console.log("Email sent Successfully: ", mailResponse);
    }
    catch(error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next){                        //here pre-save means otp is sended before the saving of OTPSchema.
    // Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
    next();
}) 



module.exports = mongoose.model("OTP", OTPSchema);