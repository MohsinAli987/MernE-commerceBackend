const app = require("./app");

const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connect_database = require("./config/database");

// Handle uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Exception`);
});

// config
dotenv.config({ path: "backend/config/config.env" });

// connection to database
connect_database();

cloudinary.config({
  cloud_name: "dzh8r3t58",
  api_key: "657522274238212",
  api_secret: "lNWuv8R8s2LJGUeoFi0AoOGhPYo",
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server is working on http://localhost:${process.env.PORT}`);
});

// unhandled promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
