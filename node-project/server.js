const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
// Apna MongoDB URI yahan replace karein
const MONGO_URI = 'mongodb://localhost:27017/valex_db';
// Ya MongoDB Atlas use karo:
// const MONGO_URI = 'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/valex_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ✅ Profile Schema
const profileSchema = new mongoose.Schema({
  username:    { type: String, required: true },
  firstName:   { type: String },
  lastName:    { type: String },
  nickName:    { type: String },
  designation: { type: String },
  email:       { type: String, required: true, unique: true },
  website:     { type: String },
  phone:       { type: String },
  address:     { type: String },
  language:    { type: String },
  social: {
    twitter:  { type: String },
    facebook: { type: String },
    google:   { type: String },
    linkedin: { type: String },
    github:   { type: String },
  },
  bio:         { type: String },
  updatedAt:   { type: Date, default: Date.now }
});

const Profile = mongoose.model('Profile', profileSchema);

// ✅ Routes

// Profile Save / Update
app.post('/api/profile/save', async (req, res) => {
  try {
    const data = req.body;

    // Email ke basis par update karo, nahi hai toh naya banao
    const profile = await Profile.findOneAndUpdate(
      { email: data.email },
      { ...data, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Profile saved!', profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Profile Get (email se)
app.get('/api/profile/:email', async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.params.email });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Server Start
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));