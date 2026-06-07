const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
 const multer = require("multer");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

mongoose
  .connect("mongodb://127.0.0.1:27017/valex_db")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));



const profileSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  nickName: String,
  designation: String,
  email: {
    type: String,
    unique: true,
  },
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

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Profile = mongoose.model("Profile", profileSchema);
app.post(
  "/api/profile/save",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const data = req.body;

      data.email = data.email.toLowerCase();

      if (req.file) {
        data.profileImage = `/uploads/${req.file.filename}`;
      }

      const profile = await Profile.findOneAndUpdate(
        { email: data.email },
        {
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          nickName: data.nickName,
          designation: data.designation,
          email: data.email,
          website: data.website,
          phone: data.phone,
          address: data.address,
          language: data.language,
          bio: data.bio,
          profileImage: data.profileImage,

          social: {
            twitter: data.twitter,
            facebook: data.facebook,
            google: data.google,
            linkedin: data.linkedin,
            github: data.github,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      res.json({
        success: true,
        message: "Profile Saved Successfully",
        profile,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

app.get("/api/profile/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();

    const profile = await Profile.findOne({
      email,
    });

    if (!profile) {
      return res.json({
        success: false,
        message: "Profile Not Found",
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server Running On Port 3000");
});