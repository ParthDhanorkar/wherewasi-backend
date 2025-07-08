const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        require:[true,"User Name Is Required"],
        unique:true,
        minlength: 3,
        maxlength: 30,
    },
    email:{
        type:String,
        require:[true,"Email Is Required"],
        unique:true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password:{
        type:String,
        require:[true,"Password Is Required"],
    },
    answer:{
        type:String,
        require:[true,"Answer Is Required"],
    }
},{timestamps:true});


module.exports=mongoose.model('User',userSchema);