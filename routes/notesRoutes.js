const express=require('express');
const router=express.Router();
const { addNoteController, getMyNotesController, updateNoteController, deleteNoteController, filterNotesController, getNearMeNotesController } = require('../controller/notesController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage(); // save file in RAM as Buffer
const upload = multer({ storage });

// Add Post
router.post('/add', authMiddleware, upload.single('image'), addNoteController);

//get all Notes
router.get('/my-notes', authMiddleware, getMyNotesController);

//update Note
router.put('/update/:id', authMiddleware, upload.single('image'), updateNoteController);

//delete Note
router.delete('/delete/:id', authMiddleware, deleteNoteController);

//filter notes
router.get('/filter', authMiddleware, filterNotesController);
///api/notes/filter?mood=sad&startDate=2025-06-01&endDate=2025-06-30
// can give any one of the above filter


//notes within area
router.get('/near-me', authMiddleware, getNearMeNotesController);
//GET /api/notes/near-me?latitude=19.1234&longitude=72.9876&distance=5

module.exports=router;