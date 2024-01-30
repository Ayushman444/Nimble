const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req,res) =>{
    try{
        //data fetch
        //data validation
        //create section
        // push the object id of this section in the  course schema
        //return response

        //data fetch
        const {sectionName, courseID} = req.body; // we will send the course ID we will send as the course is already created 


        //data validation
        if(!sectionName || !courseID){
            return res.status(400).json({
                success:false,
                message:'Missing properties',
            })
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,  {$push:{ courseContent:newSection._id, }}, {new:true},).populate({path: "courseContent",populate: {path: "subSection",},}).exec();

        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        })


    }catch(e){
        return res.status(500).json({
            success:false,
            message:"Some error in the create section controller function",
            error:error.message,
        })
    }
}

exports.updateSection = async (req,res)=>{
    try{
        // section name input data
        const {sectionName, sectionId} = req.body;
        //data validation 
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'Missing properties',
            })
        }
        //update wherever data is stored

        const Section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return respinse
        return res.status(200).json({
            success:true,
            message:"Section name updated successfully"
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:"Some error in the update section controller function",
            error:error.message,
        })
    }
}