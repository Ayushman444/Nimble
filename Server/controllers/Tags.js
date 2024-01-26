const Tag = require("../models/Tag");

//create tag controller for admin

exports.createTag = async(req,res)=>{
    try{
        const {name,description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        //create entry in db
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        })
        console.log(tagDetails);

        return res.status(200).json({
            success:true,
            message:"Tag created successfully",
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
}


//get all tags controller function

exports.showAllTags = async(req,res)=>{
    try{
        const allTags = await Tag.find({},{name:true, description:true});
        res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            allTags
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:e.message
        })
    }
}