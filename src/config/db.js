const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://admin:SpO0UQulIAytIHZf@backenddb.wpmjknx.mongodb.net/ecommerce?retryWrites=true&w=majority"
    );
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
