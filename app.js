/*
File Purpose: This is the main file which starts up the NodeJS backend server
*/

// To create server and manage format data is transmitted NOTE
const express = require("express");
const bodyParser = require("body-parser");

// To manipulate file system and manage photos uploaded by users NOTE
// Multer is for managing user entered photos
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// To set up CORS options NOTE
const cors = require("cors");

// Get environment variables NOTE
const { SERVER_PORT, FRONTEND_URL } = require("./config");

// Set up routes NOTE
const usersRoutes = require("./routes/users");
const productRoutes = require("./routes/products")
// Start up server STEP
const app = express();

app.listen(SERVER_PORT, () => {
  console.log(`Listening on ${SERVER_PORT}`);
});

// Set up CORS for app STEP
var corsOptions = {
  origin: FRONTEND_URL,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Determine how data is transmitted with body-parser STEP
app.use(bodyParser.json());

// Set up multer STEP

// Set up routes STEP
app.use("/users", usersRoutes);
app.use("/products", productRoutes)
