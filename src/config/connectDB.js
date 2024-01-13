const mongoose = require("mongoose");

let conn;

const connectDB = async () => {
  try {
    if (!conn) {
      conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;