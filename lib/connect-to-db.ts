import mongoose from "mongoose";

// Track the connection state
let isConnected = false;

export const connectToDatabase = async () => {
  const MONGO_DB_URI = process.env.MONGO_DB_URI!;

  // If already connected, return the existing connection
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    // Set strictQuery to prepare for Mongoose 7
    mongoose.set("strictQuery", false);

    // Configure connection options
    const options = {
      bufferCommands: true, // Allow buffering commands until connection is established
      autoIndex: true, // Build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };

    // Connect to MongoDB
    const connection = await mongoose.connect(MONGO_DB_URI, options);

    // Set connection flag
    isConnected = !!connection.connections[0].readyState;

    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to database");
  }
};
