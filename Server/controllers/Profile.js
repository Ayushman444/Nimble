const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    //get data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    //get userID
    const id = req.user.id;
    //validation
    if (!id || !contactNumber || !gender) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required fields",
        });
    }
    //find profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    //update profile
    profileDetails.dataOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    //update profile
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profileDetails,
    });
    //return response
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Some error occured in update Profile controller",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    //get id
    const id = req.user.id;

    //validation
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res
        .status(404)
        .josn({ success: false, message: "User not found" });
    }
    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //TODO : HW un enroll user from all enrolled courses
    //delete user
    await User.findByIdAndDelete({ _id: id });

    //return response
    return res.status(200).json({
        success:true,
        message:"Account deleted successfully"
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Some error occured in delete account controller",
    });
  }
};

exports.getAllUserDetails = async(req,res)=>{
    try{
        //get id
        const id = req.user.id;
        //validation
        //user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec()
        //return res
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
