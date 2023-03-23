export default {
  id: "default",
  url: process.env.MONGO_URL || "MONGO_URL=mongodb+srv://sa:UEuzGbyJmTbp6Kyo@cluster0.rpo4b8f.mongodb.net/?retryWrites=true&w=majority",
  connectionOptions: { 
    maxIdleTimeMS: 180000,
    serverSelectionTimeoutMS: 30000
  }
};
