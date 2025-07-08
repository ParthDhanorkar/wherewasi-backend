const mongoose=require('mongoose');
const colors=require('colors');

const connectDB=async()=>{
    try {
        const connect=await mongoose.connect(process.env.MONGO_URL);
        if(connect){
            console.log("Database Connected Successfully".bgCyan);
            
        }
    } catch (error) {
        console.log("Error In Database Connection ",error,colors.bgRed);
        
    }
    
};

module.exports=connectDB;