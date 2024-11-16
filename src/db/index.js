import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`)
  } catch (error) {
    console.error("Error connecting to MongoDB\n", error);
    process.exit(1);
  }
};

export default connectDB;
