import mongoose from "mongoose";

const connectDB = async (callback = () => {}) => {
  try {
    const connect = await mongoose.connect(process.env.DB_URI);
    callback();
    console.log("Database connected: ", connect.connection.host, connect.connection.name);
  } catch (err) {
    console.error("MongoDB error.");
    process.exit();
  }
};

export default connectDB;
