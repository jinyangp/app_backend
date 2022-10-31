/*
File Purpose: This file handles the retrieval/ updating of data as requested by
the routed API endpoints pertaining to users
*/

/*

Ideas of controllers: NOTE
1: Conrolles receive the request from router and routes request to the
correct endpoint with the appropriate data
2: Controller returns a callback function that takes in 2 arguments (error, results)

*/

const fs = require("fs");
const path = require("path");

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dbconnect = require("../middlewares/dbconfig");
const { ACCESS_TOKEN_SECRET } = require("../config");
const transporter = require("../middlewares/emailconfig");

// GET /users/verifyJWT
exports.verifyJWT = function (userDetails, callback) {
  const userToken = userDetails.userToken;
  const userId = userDetails.userId;

  if (userToken == undefined) {
    return callback(null, { message: "No JWT token" });
  }

  // Verify JWT
  // If JWT cannot be verified, return unauthenticated STEP
  jwt.verify(userToken, ACCESS_TOKEN_SECRET, (err, results) => {
    if (err) {
      return callback(null, { message: "Invalid JWT" });
    }

    if (userId != results.userId) {
      return callback(null, { message: "Incorrect user" });
    }

    return callback(null, { message: "Authenticated" });
  });
};

// GET /users/login
exports.login = function (userDetails, callback) {
  // Create the db connection and try to connect to it STEP
  const conn = dbconnect.getConnection();

  // Try to establish a connection STEP
  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  // Get relevant user details from router STEP
  const userNameOrEmail = userDetails.userNameOrEmail;
  const userPassword = userDetails.userPassword;
  let fetchedUserDetails = {};

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
        fetchedUserDetails = {
          userId: result[0].user_id,
          userName: result[0].user_name,
          userImageUrl: result[0].user_imageurl,
        };

        let sqlQuery =
          "SELECT wishlist_product_id FROM wishlist_items WHERE wishlist_user_id = ?";

        conn.query(sqlQuery, [fetchedUserDetails.userId], (err, result) => {
          conn.end();

          if (err) {
            return callback(err, null);
          }

          fetchedUserDetails.wishlistIds = [];
          for (let wlItem of result) {
            fetchedUserDetails.wishlistIds.push(wlItem.wishlist_product_id);
          }

          const data = {
            ...fetchedUserDetails,
            token: jwt.sign(fetchedUserDetails, ACCESS_TOKEN_SECRET, {
              expiresIn: "1h",
            }),
            message: "Authenticated",
          };

          return callback(null, data);
        });
      })
      .catch((err) => {
        return callback(err, null);
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

  // May have to include a regex here to check password LEFTOFFAT
  // If frontend does validation, not needed

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

/*

Idea for resetting password: NOTE

Server verifies token when
1. user reset email clicked
2: user submits password on reset password paeg
by checking that token same as one for user in the DB

When password changed successfully or token expires, delete token from database

*/

// GET /users/getResetPWLink
exports.getResetPWLink = function (userEmail, callback) {
  // Establish connection and connect to DB STEP
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  // Check if there is such a registered email in DB STEP
  let sqlQuery = "SELECT * FROM users WHERE user_email = ?";

  conn.query(sqlQuery, [userEmail], (err, result) => {
    if (err) {
      return callback(err, null);
    }

    // If this email is not registered, send back an error STEP
    if (result.length == 0) {
      return callback(null, { message: "Invalid email entered" });
    }

    // If there is such a registered email,
    const userId = result[0].user_id;

    // generate a random byte string STEP
    const securityToken = crypto.randomBytes(16).toString("hex");

    // generate expiry time STEP
    // expiry time to be set to 30mins from current time
    // represented in number of seconds since 1 January 1970
    const expiryTime = Math.floor(Date.now() / 1000) + 30 * 60;

    // save it in pw_pin table STEP
    sqlQuery =
      "INSERT INTO resetpw_pins (user_id, security_token, expiry_time) VALUES (?, ?, ?)";

    conn.query(sqlQuery, [userId, securityToken, expiryTime], (err, result) => {
      conn.end();

      if (err) {
        return callback(err, null);
      }

      // if successfully saved into pw_pin table,
      if (result.affectedRows == 1) {
        // prepare the mail to be sent out STEP
        let mailOptions = {
          from: "PriceFix <pricefix.noreply@gmail.com>",
          to: userEmail,
          subject: "Reset Password Requested",
          html: `
        <p>You have requested to reset your password.</p>
        <p>Please use this reset link: http://localhost:3000/resetPassword/?token=${securityToken}</p>
    
        Best Wishes, <br/>
        <p>PriceFix</p>
        `,
        };

        // send out the mail STEP
        transporter.sendMail(mailOptions, function (err, data) {
          if (err) {
            return callback(err, null);
          }

          return callback(null, { message: "Successful" });
        });
      }
    });
  });
};

// GET /users/validateResetPWLink
exports.validateResetPWLink = function (securityToken, callback) {
  // Establish connection and connect to db STEP
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  // Prepare sql query STEP
  let sqlQuery = "SELECT * FROM resetpw_pins WHERE security_token = ?";

  conn.query(sqlQuery, [securityToken], (err, result) => {
    // End db connection STEP
    conn.end();

    if (err) {
      return callback(err, null);
    }

    // If no such pin is found, this pin is invalid so reset PW link is invalid STEP
    if (result.length == 0) {
      return callback(null, { message: "Pin not found" });
    }

    // If the pin is expired, this pin is invalid so reset PW link is invalid STEP
    if (Date.now() > result[0].expiry_time * 1000) {
      return callback(null, { message: "Pin expired" });
    }

    // If pin is present and not expired, pin is valid so reset PW link is valid
    // Send back the user id as well STEP
    return callback(null, { message: "Pin valid", userId: result[0].user_id });
  });
};

// DELETE /users/deleteResetPin
exports.deleteResetPWPin = function (userId, callback) {
  // Establish connection and connect to db STEP
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  // Prepare sql query STEP
  let sqlQuery = "DELETE FROM resetpw_pins WHERE user_id = ?";

  // Query database STEP
  conn.query(sqlQuery, [userId], (err, result) => {
    // End connection with db STEP
    conn.end();

    if (err) {
      return callback(err, null);
    }

    // If no pin found, return no pin found error message STEP
    if (result.affectedRows == 0) {
      return callback(null, { message: "No pin found" });
    }

    // Else, return success message STEP
    return callback(null, { message: "Success" });
  });
};

// PUT /users/updatePW
exports.updatePW = function (userDetails, callback) {
  // Establish connection with db STEP
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  // Deconstruct variables from object passed in STEP
  const { userPassword, userId } = userDetails;

  // Hash the new password STEP
  bcrypt
    .hash(userPassword, 12)
    .then((hashedPW) => {
      // Next, find the user and update the password STEP
      let sqlQuery = "UPDATE users SET user_password = ? WHERE user_id = ?";

      conn.query(sqlQuery, [hashedPW, userId], (err, result) => {
        conn.end();

        if (err) {
          return callback(err, null);
        }

        // If no user with this user_id found, STEP
        if (result.affectedRows == 0) {
          return callback(null, { message: "User not found" });
        }

        // Else if successful, return successfully STEP
        return callback(null, { message: "Success" });
      });
    })
    .catch((err) => {
      return callback(err, null);
    });
};

// PUT /users/updateDetails
exports.updateUserDetails = function (userDetails, callback) {
  // Establish connection with db STEP
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  const { userId, userName, userEmail } = userDetails;

  // Check if user entered details are valid first
  // i.e. the new userName and userEmail should be unique STEP
  let sqlQuery = "SELECT * FROM users WHERE user_name = ? OR user_email = ?";

  conn.query(sqlQuery, [userName, userEmail], (err, result) => {
    if (err) {
      return callback(err, null);
    }

    // If details not are valid, return an error STEP
    if (result.length > 0 && result[0].user_email == userEmail) {
      return callback(null, { message: "Email already in use" });
    } else if (result.length > 0 && result[0].user_name == userName) {
      return callback(null, { message: "User name already in use" });
    }

    // If no matches are found, details are valid STEP
    // Proceed to update details
    sqlQuery =
      "UPDATE users SET user_name = ?, user_email = ? WHERE user_id = ?";

    conn.query(sqlQuery, [userName, userEmail, userId], (err, result) => {
      // End connection with db STEP
      conn.end();

      if (err) {
        return callback(err, null);
      }

      // If no users are found, STEP
      if (result.affectedRows == 0) {
        return callback(null, { message: "User not found" });
      }

      // If details are updated successfully STEP
      return callback(null, { message: "Successful" });
    });
  });
};

exports.updateUserImage = function (userDetails, callback) {
  // Establish connection with db STEP
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  const { userId, userOldImageUrl, userNewImageUrl } = userDetails;

  // Check if user previously had a user image STEP
  // If true, delete the old image from file system STEP
  // Get file path STEP
  const imageUrlPath =
    userOldImageUrl == "null"
      ? null
      : path.join(__dirname, "..", "images", userOldImageUrl);

  // Then, save image file on to backend with new url
  // Done with the multer middleware in app.js NOTE
  // Receive the new image file path from multe STEP
  const newImageUrl = userNewImageUrl.slice(7).replace("\\", "/");

  // Then, save details in db STEP
  let sqlQuery = "UPDATE users SET user_imageurl = ? WHERE user_id = ?";

  // Execute sql query STEP
  conn.query(sqlQuery, [newImageUrl, userId], (err, result) => {
    conn.end();

    // End connection with db STEP
    if (err) {
      return callback(err, null);
    }

    // If no users are found, STEP
    if (result.affectedRows == 0) {
      return callback(null, { message: "User not found" });
    }

    // If user found, delete old image if there is one STEP
    if (imageUrlPath != undefined) {
      fs.unlink(imageUrlPath, (err) => {
        if (err) {
          console.log(err);
          return callback(err, null);
        }

        return callback(null, { message: "Successful" });
      });
    } else {
      return callback(null, { message: "Successful" });
    }
  });
};

exports.deleteUserImage = function (userDetails, callback) {
  // Establish connection with db STEP
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  const { userId, userOldImageUrl } = userDetails;

  let sqlQuery = "UPDATE users SET user_imageurl = NULL WHERE user_id = ?";

  // Execute sql query STEP
  conn.query(sqlQuery, [userId], (err, result) => {
    conn.end();

    // End connection with db STEP
    if (err) {
      return callback(err, null);
    }

    // If no users are found, STEP
    if (result.affectedRows == 0) {
      return callback(null, { message: "User not found" });
    }

    const imageUrlPath = path.join(__dirname, "..", "images", userOldImageUrl);

    fs.unlink(imageUrlPath, (err) => {
      if (err) {
        console.log(err);
        return callback(err, null);
      }

      return callback(null, { message: "Successful" });
    });
  });
};
