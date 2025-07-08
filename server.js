const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
const morgan=require('morgan');
const colors=require('colors');
const connectDB = require('./config/db');

const app=express();


//config
dotenv.config();

//DB Connection
connectDB();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth',require('./routes/authRoutes'));
app.use('/api/v1/user',require('./routes/userRoutes'));
app.use('/api/v1/notes',require('./routes/notesRoutes'));

app.get('/',(req,res)=>{
     return res.status(200).send("HIII")
})




const PORT=process.env.PORT || 8081;
app.listen(PORT,()=>{
    console.log(`Server Running On Port ${PORT} Successfully`.green.bgGreen); 
})

