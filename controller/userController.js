const userModel = require("../model/userModel");
const bcrypt=require('bcryptjs')




const getUserController = async (req, res) => {
  try {
    // req.user.id comes from authMiddleware
    const user = await userModel.findById(req.user.id).select("-password -answer"); // exclude password

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error in getUserController:", error);
    return res.status(500).send({
      success: false,
      message: "Server error while fetching user",
      error,
    });
  }
};

module.exports = { getUserController };


// update password
const updatePasswordUserController = async (req, res) => {
  try {
    const { oldPassword = "", newPassword = "" } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Please provide old and new password",
      });
    }

    // Get logged-in user from authMiddleware
    const user = await userModel.findById({_id:req.user.id});
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in update password controller",
      error,
    });
  }
};

// change username

const changeUsernameController = async (req, res) => {
  try {
    const { newUserName = "" } = req.body;

    // Validate: not empty & not only spaces
    if (!newUserName.trim()) {
      return res.status(400).send({
        success: false,
        message: "New username cannot be empty or spaces only",
      });
    }

    // Check if username already exists
    const existingUser = await userModel.findOne({
      userName: newUserName.trim(),
    });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Username already taken, please choose another",
      });
    }

    // Get logged-in user by id (authMiddleware adds req.user)
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    // Update username
    user.userName = newUserName.trim();
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Username updated successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in change username controller",
      error,
    });
  }
};

// delete user

const deleteUserController = async (req, res) => {
  try {
    // req.user.id comes from authMiddleware (user must be logged in)
    const user = await userModel.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in delete user controller",
      error,
    });
  }
};

module.exports = {
  updatePasswordUserController,
  changeUsernameController,
  deleteUserController,
  getUserController
};
