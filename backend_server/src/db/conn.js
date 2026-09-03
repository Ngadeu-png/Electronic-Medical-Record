const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config()

async function dbConnect() {
    mongoose
      .connect(process.env.MONGO_URI || "mongodb://localhost:27017/emedical", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.error(" MongoDB connection error:", err));
    
}
module.exports = dbConnect;