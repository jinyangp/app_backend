/*
File Purpose: This file handles the retrieval/ updating of data as requested by
the routed API endpoints pertaining to users
*/

/*

Ideas of controllers: NOTE
1: Conrolles receive the request from router and routes request to the
correct endpoint with the appropriae data
2: Controller returns a callback function that takes in 2 arguments (error, results)

*/

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dbconnect = require("../middlewares/dbconfig");
const { ACCESS_TOKEN_SECRET } = require("../config");

// GET /users/login
exports.login = function (userDetails, callback) {
  // Create the db connection and try to connect to it STEP
  const conn = dbconnect.getConnection();

  // Try to establish a connection STEP
  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }

    // Get relevant user details from router STEP
    const userNameOrEmail = userDetails.userNameOrEmail;
    const userPassword = userDetails.userPassword;

    // Check if user name or email matches first STEP
    let sqlQuery = "SELECT * FROM users WHERE user_name = ? OR user_email = ?";

    conn.query(sqlQuery, [userNameOrEmail, userNameOrEmail], (err, result) => {
      if (err) {
        return callback(err, null);
      }

      // if no such user found with these details STEP
      if (result.length == 0) {
        return callback(null, { message: "Unauthenticated" });
      }

      // Compare plain text password from router with hashed password in DB STEP
      bcrypt
        .compare(userPassword, result[0].user_password)
        .then((pwMatches) => {
          // if user entered password is wrong, unauthenticated STEP
          if (!pwMatches) {
            return callback(null, { message: "Unauthenticated" });
          }

          // prepare and return back user data if authenticated STEP
          const userDetails = {
            userId: result[0].user_id,
            userName: result[0].user_name,
            userImageUrl: result[0].user_imageurl,
          };

          const data = {
            ...userDetails,
            token: jwt.sign(userDetails, ACCESS_TOKEN_SECRET, {
              expiresIn: "1h",
            }),
            message: "Authenticated",
          };

          return callback(null, data);
        })
        .catch((err) => {
          return callback(err, null);
        });
    });
  });
};

// POST /users/signup
exports.signup = function (userDetails, callback) {
  // Establish connection with DB STEP
  const conn = dbconnect.getConnection();

  // Connect to DB STEP
  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  // Get the relevant data passed down from the router STEP
  const userName = userDetails.userName;
  const userEmail = userDetails.userEmail;
  const userPassword = userDetails.userPassword;

  // Hash the password STEP
  bcrypt
    .hash(userPassword, 12)
    .then((hashedPW) => {
      // Query the DB STEP
      const sqlQuery =
        "INSERT INTO users (user_name, user_email, user_password) VALUES (?, ? , ?);";

      // Create a new user in DB and then return the relevant error or results STEP
      conn.query(sqlQuery, [userName, userEmail, hashedPW], (err, result) => {
        // End connection with DB STEP
        conn.end();

        if (err) {
          return callback(err, null);
        }

        if (result.affectedRows == 1) {
          return callback(null, { message: "User created" });
        }
      });
    })
    .catch((err) => {
      return callback(err, null);
    });
};
