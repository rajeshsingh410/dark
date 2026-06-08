const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
if (!fs.existsSync("uploads/")) {
  fs.mkdirSync("uploads/");
}
app.use("/uploads", express.static("uploads"));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }); // Multer initialization

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/valex_db")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// Schema Definition
const profileSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  nickName: String,
  designation: String,
  email: { type: String, unique: true, lowercase: true },
  profileImage: String,
  website: String,
  phone: String,
  address: String,
  language: String,
  bio: String,
  social: {
    twitter: String,
    facebook: String,
    google: String,
    linkedin: String,
    github: String,
  },
  updatedAt: { type: Date, default: Date.now },
});

const Profile = mongoose.model("Profile", profileSchema);

// 1. SAVE / UPDATE PROFILE ROUTE
// Yahan upload.single("profileImage") lagaya hai jo HTML ke name="profileImage" se match karega
app.post("/api/profile/save", upload.single("profileImage"), async (req, res) => {
    try {
      const data = req.body;
      if (!data.email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      const emailKey = data.email.toLowerCase().trim();
      
      // Image path setup
      let currentProfileImage = data.profileImage || "";
      if (req.file) {
        currentProfileImage = `/uploads/${req.file.filename}`;
      }

      const updateData = {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        nickName: data.nickName,
        designation: data.designation,
        email: emailKey,
        website: data.website,
        phone: data.phone,
        address: data.address,
        language: data.language,
        bio: data.bio,
        profileImage: currentProfileImage,
        social: {
          twitter: data.twitter,
          facebook: data.facebook,
          google: data.google,
          linkedin: data.linkedin,
          github: data.github,
        },
        updatedAt: new Date()
      };

      const profile = await Profile.findOneAndUpdate(
        { email: emailKey },
        updateData,
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        message: "Profile Saved Successfully",
        profile,
      });
    } catch (err) {
      console.error("Save Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// 2. GET PROFILE ROUTE
app.get("/api/profile/:email", async (req, res) => {
  try {
    const emailParam = req.params.email.toLowerCase().trim();
    const profile = await Profile.findOne({ email: emailParam });

    if (!profile) {
      return res.json({ success: false, message: "Profile Not Found" });
    }

    res.json({ success: true, profile });
  } catch (err) {
    console.error("Get Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server Running On Port 3000");
});