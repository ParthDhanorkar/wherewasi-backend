const noteModel = require('../model/notesModel');


// Add Notes
const addNoteController = async (req, res) => {
  try {
    const { title, text, mood, latitude, longitude } = req.body;

    // Validate required fields
    if (!mood || !latitude || !longitude) {
      return res.status(400).send({
        success: false,
        message: "Mood, latitude and longitude are required",
      });
    }

    // Create new note object
    const newNote = new noteModel({
      userId: req.user.id,   // added by authMiddleware
      title,
      text,
      mood,
      location: {
        latitude,
        longitude
      }
    });

    // Handle image if uploaded
    if (req.file) {
      newNote.image.data = req.file.buffer;
      newNote.image.contentType = req.file.mimetype;
    }

    // Save note
    await newNote.save();

    return res.status(201).send({
      success: true,
      message: "Note added successfully",
      note: newNote
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in add note controller",
      error
    });
  }
};


// get All Notes
const getMyNotesController = async (req, res) => {
    try {
      const notes = await noteModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
  
      const notesWithImages = notes.map(note => {
        let imageBase64 = null;
        if (note.image && note.image.data) {
          imageBase64 = `data:${note.image.contentType};base64,${note.image.data.toString('base64')}`;
        }
        // add new field instead of replacing image object
        return {
          ...note.toObject(),
          imageBase64
        };
      });
  
      return res.status(200).send({
        success: true,
        message: "My notes fetched successfully",
        total: notes.length,
        notes: notesWithImages
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        success: false,
        message: "Error in get my notes controller",
        error: error.message
      });
    }
  };
  


//Update Note
// Update Note
const updateNoteController = async (req, res) => {
    try {
      const { title, text, mood, latitude, longitude } = req.body;
  
      // Validate mood if provided
      if (mood && !["Happy", "Sad", "Excited"].includes(mood)) {
        return res.status(400).send({
          success: false,
          message: "Invalid mood value. Must be 'Happy', 'Sad', or 'Excited'."
        });
      }
  
      // Find the note by ID and ensure it belongs to the logged-in user
      const note = await noteModel.findOne({ _id: req.params.id, userId: req.user.id });
      if (!note) {
        return res.status(404).send({
          success: false,
          message: "Note not found or you don't have permission"
        });
      }
  
      // Update fields if provided
      if (title) note.title = title;
      if (text) note.text = text;
      if (mood) note.mood = mood;
      if (latitude && longitude) {
        note.location.latitude = latitude;
        note.location.longitude = longitude;
      }
  
      // Replace image if uploaded
      if (req.file) {
        note.image.data = req.file.buffer;
        note.image.contentType = req.file.mimetype;
      }
  
      // Save updated note
      await note.save();
  
      // Convert to object & add imageBase64 for frontend
      const updatedNote = note.toObject();
      if (updatedNote.image?.data) {
        updatedNote.imageBase64 = `data:${updatedNote.image.contentType};base64,${updatedNote.image.data.toString("base64")}`;
      }
  
      return res.status(200).send({
        success: true,
        message: "Note updated successfully",
        note: updatedNote
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        success: false,
        message: "Error in update note controller",
        error: error.message
      });
    }
  };
  

//Delete Note
const deleteNoteController = async (req, res) => {
  try {
    // Find and delete the note owned by logged-in user
    const deletedNote = await noteModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deletedNote) {
      return res.status(404).send({
        success: false,
        message: "Note not found or you don't have permission to delete"
      });
    }

    return res.status(200).send({
      success: true,
      message: "Note deleted successfully",
      noteId: deletedNote._id
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in delete note controller",
      error
    });
  }
};

// filters Notes (mood,startdate ,enddate)
const filterNotesController = async (req, res) => {
  try {
    const { mood, startDate, endDate } = req.query;

    // Build dynamic filter
    const filter = { userId: req.user.id };

    if (mood) {
      // Validate mood value
      if (!["Happy", "Sad", "Excited"].includes(mood)) {
        return res.status(400).send({
          success: false,
          message: "Invalid mood value. Must be 'Happy', 'Sad', or 'Excited'."
        });
      }
      filter.mood = mood;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Find notes matching filter, newest first
    const notes = await noteModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Filtered notes fetched successfully",
      total: notes.length,
      notes
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in filter notes controller",
      error
    });
  }
};


//notes within locations 

// Haversine formula to calculate distance (in km)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

const getNearMeNotesController = async (req, res) => {
  try {
    const { latitude, longitude, distance } = req.query;

    // Validate
    if (!latitude || !longitude || !distance) {
      return res.status(400).send({
        success: false,
        message: "Please provide latitude, longitude and distance in km"
      });
    }

    // Convert to numbers
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const distKm = parseFloat(distance);

    if (isNaN(lat) || isNaN(lon) || isNaN(distKm)) {
      return res.status(400).send({
        success: false,
        message: "Invalid query parameters. Must be numbers."
      });
    }

    // Find all notes of logged-in user
    const allNotes = await noteModel.find({ userId: req.user.id });

    // Filter notes within distance
    const nearbyNotes = allNotes.filter(note => {
      if (!note.location || !note.location.latitude || !note.location.longitude) {
        return false;
      }
      const noteLat = note.location.latitude;
      const noteLon = note.location.longitude;
      const noteDistance = getDistanceFromLatLonInKm(lat, lon, noteLat, noteLon);
      return noteDistance <= distKm;
    });

    return res.status(200).send({
      success: true,
      message: "Nearby notes fetched successfully",
      total: nearbyNotes.length,
      notes: nearbyNotes
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in get near me notes controller",
      error
    });
  }
};





module.exports = { addNoteController ,
    getMyNotesController,updateNoteController,
    deleteNoteController,filterNotesController,getNearMeNotesController};
