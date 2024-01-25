const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
  try {
    //extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");

    // if token is missing , then return response
    if(!token){
      return res.status(401).json({
        success:false,
        message:" token is missing ",
      })
    }  

    //verify the token
    try{
      const decode = await jwt.verify(token, process.env.JWT_SECRET)
      console.log(decode);
      req.user = decode;
    }catch(e){
      //verification issue
      return res.status(401).json({
        success:false,
        message:'token in invalid',
      })
    }
    next();
  } catch (e) {
    return res.status(401).json({
      success:false,
      message:'something went wrong while verifying the token'
    })
  }
};

//isStudent
exports.isStudent = async (req,res,next) =>{
  
}
//inInstructor

//isAdmin
