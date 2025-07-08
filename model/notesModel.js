const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,  
  },
  title: {
    type: String,
  },
  text: {
    type: String,
  },
  mood: {
    type: String,
    required: [true, "Mood is required"],
    enum: ["Happy", "Sad", "Excited"]
  },
  location: {
    latitude: {
      type: Number,
      required: [true, "Latitude is required"]
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"]
    }
  },
  image:{
    data: Buffer,
    contentType: String  
  }
},{ timestamps: true });

module.exports = mongoose.model('Notes', notesSchema);
