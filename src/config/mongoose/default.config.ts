export default {
  id: "default",
  url: process.env.MONGO_URL || "mongodb://mongodb:27017",
  connectionOptions: { 
    maxIdleTimeMS: 180000,
    serverSelectionTimeoutMS: 30000
  }
};
