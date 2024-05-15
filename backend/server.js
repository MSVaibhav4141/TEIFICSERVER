const instance = require('../backend/razorpayIns');
const app = require("./app");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectDatabase = require("./database/databaseConnnection");

dotenv.config({ path: "backend/config/config.env" });

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

module.exports = instance;
//Uncaught Error

process.on("uncaughtException", (err) => {
  console.log(`Error  : ${err.message}`);
  console.log(`Shutting Down The server due to Uncaught Exception Error`);

  process.exit(1);
});

// Connection To Database
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on localhost:${process.env.PORT}`);
});

// Unhandled Promise Rejection Error
process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Shutting Down The server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
