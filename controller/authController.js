const userModel = require("../model/userModel");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// register User
const registerUserController = async (req, res) => {
  try {
    const { userName, email, answer, password } = req.body;

    // Validations
    if (!userName || !email || !answer || !password) {
      return res.status(500).send({
        success: false,
        message: "All Fields Are Required",
      });
    }

    if (!userName.trim()) {
      return res.status(400).send({
        success: false,
        message: "User Name cannot be empty or spaces only",
      });
    }

    // check username exists
    const checkUserName = await userModel.findOne({ userName });
    if (checkUserName) {
      return res.status(500).send({
        success: false,
        message: "User Name Already Exists",
      });
    }

    // check email
    const checkEmail = await userModel.findOne({ email });
    if (checkEmail) {
      return res.status(500).send({
        success: false,
        message: "Email Already Exists Please Login",
      });
    }

    // bcryptPassword
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create user
    const newUser = await userModel.create({
      userName,
      email,
      answer,
      password: hashedPassword,
    });

    //jwt token
    const token = JWT.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // hide info password,answer
    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.answer;
    // success
    return res.status(200).send({
      success: true,
      message: "User Registered Successfully",
      token,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Register user Controller",
      error,
    });
  }
};


// Login User
const loginUserController = async (req, res) => {
  try {
    const { userName = "", email = "", password = "" } = req.body;

    // validations username or password

    const hasValidUserName = userName.trim();
    const hasValidEmail = email.trim();

    if ((!hasValidUserName && !hasValidEmail) || !password) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    // check user exist or not
    let user;
    if (hasValidUserName) {
      user = await userModel.findOne({ userName });
    }
    if (!user && email) {
      user = await userModel.findOne({ email });
    }

    if (!user) {
      return res.status(500).send({
        success: false,
        message: "User Not Found Please Register",
      });
    }

    // hash password to check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Incorrect Credintials",
      });
    }
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.answer;

    // creating jwt token
    const token = await JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    //Successful login
    return res.status(201).send({
      success: true,
      message: "Login Successful",
      token,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Login user Controller",
      error,
    });
  }
};

// forget Password

const forgetPasswordUserController = async (req, res) => {
    try {
      const { userName = '', email = '', answer, password } = req.body;
  
      const hasValidUserName = userName.trim();
      const hasValidEmail = email.trim();
  
      if ((!hasValidUserName && !hasValidEmail) || !answer || !password) {
        return res.status(400).send({
          success: false,
          message: "Please provide all fields",
        });
      }
  
      let user;
      if (hasValidUserName) {
        user = await userModel.findOne({ userName });
      }
      if (!user && hasValidEmail) {
        user = await userModel.findOne({ email });
      }
  
      if (!user) {
        return res.status(400).send({
          success: false,
          message: "User not found. Please register first.",
        });
      }
  
      if (user.answer.toLowerCase() !== answer.toLowerCase()) {
        return res.status(400).send({
          success: false,
          message: "Incorrect security answer",
        });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      user.password = hashedPassword;
      await user.save();
  
      return res.status(200).send({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: "Error in forget password controller",
        error,
      });
    }
  };
  

module.exports = { registerUserController, loginUserController,forgetPasswordUserController };
