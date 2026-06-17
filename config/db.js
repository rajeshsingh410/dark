const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO_URL exists:", !!process.env.MONGO_URL);

    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
};

module.exports = connectDB;