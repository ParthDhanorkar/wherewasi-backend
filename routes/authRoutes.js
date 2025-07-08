const express=require('express');
const { registerUserController, loginUserController, forgetPasswordUserController } = require('../controller/authController');

const router=express.Router();

// Routes

// register (userName,email,password,answer)
router.post('/register',registerUserController);

// login (userName || email && password)
router.post('/login',loginUserController);

// forgot password
router.put('/forgot-password',forgetPasswordUserController)


module.exports=router;