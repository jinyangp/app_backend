/*
File Purpose: This is the main file which starts up the NodeJS backend server and centralises
all configurations for the server.
*/

// To create server and manage format data is transmitted NOTE
const express = require("express");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// To manipulate file system and manage photos uploaded by users NOTE
// Multer is for managing user entered photos
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// To set up CORS options NOTE
const cors = require("cors");

// Get environment variables NOTE
const { SERVER_PORT, FRONTEND_URL } = require("./config");

// To set up routes NOTE
const usersRoutes = require("./controllers/users");
const productRoutes = require("./controllers/products");
// Start up server STEP
const app = express();

app.listen(SERVER_PORT, () => {
  console.log(`Listening on ${SERVER_PORT}`);
});

// Use file upload package for handling image uploading STEP
// app.use(fileUpload());

// Determine how data is transmitted with body-parser STEP
app.use(urlencodedParser);
app.use(express.json());

// Serve static image files STEP
app.use("/images", express.static(path.join(__dirname, "images")));

// Set up multer STEP
// Set up a file storage system with multer
// a storage engine that is used with multer NOTE
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(<error>, <storage location>)
    cb(null, "images/userImages");
  },

  filename: (req, file, cb) => {
    // cb(<error>, <name of file stored>)
    // created file name cannot contain any ':' NOTE
    cb(null, uuidv4() + ".png");
  },
});

// Determine what files are to be uploaded NOTE
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Use multer to handle image uploading NOTE
// When sending request to upload photos, .single(<keyName>) keyName has to be "image" to
// match what is currently in the bracket NOTE
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// Set up CORS for app STEP
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Set up routes STEP
app.use("/users", usersRoutes);
app.use("/products", productRoutes);
