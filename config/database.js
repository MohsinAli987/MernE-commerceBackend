const mongoose = require("mongoose");

const connect_database = () => {
  const dbURL = process.env.DB_URL;

  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
    });
};

module.exports = connect_database;
