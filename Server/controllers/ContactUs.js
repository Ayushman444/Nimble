const { contactUsEmail } = require("../mail/templates/contactFormRes"); //mail template
const mailSender = require("../utils/mailSender");

exports.contactUsController = async (req, res) => {
  const { email, firstName, lastName, message, phoneNo, countryCode } =
    req.body;

  try {
    await mailSender(
      email,
      "Your Data send successfully",
      contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)
    );
    await mailSender(
      "abhikantkumar8294026755@gmail.com",
      "Someone Send this data to you",
      contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)
    );

    return res.json({
      success: true,
      message: "Email send successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Something went wrong... in contact us controller",
    });
  }
};
