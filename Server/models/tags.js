
//instance of mongoose
const mongoose = require("mongoose");

//create tagschema
const tagsSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    description: {
        type:String,
    },
    course: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
});

module.exports = mongoose.model("Tag", tagsSchema);