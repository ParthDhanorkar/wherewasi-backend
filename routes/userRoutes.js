const express=require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { updatePasswordUserController, changeUsernameController, deleteUserController, getUserController } = require('../controller/userController');
const router=express.Router();

//getUser
router.get("/get-user", authMiddleware, getUserController);

//Update Password
router.put('/update-password',authMiddleware,updatePasswordUserController)

//update userName
router.put('/change-username', authMiddleware, changeUsernameController);

//delete user
router.delete('/delete-user', authMiddleware, deleteUserController);




module.exports=router;