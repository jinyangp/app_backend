/*
File Purpose: This file handles the routing for API endpoints pertaining to users
*/

/*

Idea of routers: NOTE
1: router routes request to the appropriate controller action
2: controller action processes incoming request and retuns the results or any
errors
3: based on the results from the controller, return the appropiate HTTP status
code and results

*/

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

// GET /users/login
router.get("/login", (req, res, next) => {
  // Receive the relevant query/body parameters from frontend STEP
  const userDetails = {
    userNameOrEmail: req.query.userNameOrEmail,
    userPassword: req.query.userPassword,
  };

  // Pass data on to controller and receive callback as the results STEP
  usersController.login(userDetails, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "Unauthenticated") {
        res.status(401).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// POST /users/signup
router.post("/signup", (req, res, next) => {
  // Receive the relevant query/body parameters from frontend STEP
  const userDetails = {
    userName: req.body.userName,
    userEmail: req.body.userEmail,
    userPassword: req.body.userPassword,
  };

  // Pass data on to controller and receive callback as the results STEP
  usersController.signup(userDetails, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "User created") {
        res.status(201).send(results);
      }
    }
  });
});

// GET /users/getResetPWLink
router.get("/getResetPWLink", (req, res, next) => {
  const userEmail = req.query.userEmail;

  usersController.getResetPWLink(userEmail, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "Invalid email entered") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// This API should validate the password reset link and send back the user id
// when the reset link is valid. Else, display an error message
// GET /users/validateResetPWLink
router.get("/validateResetPWLink", (req, res, next) => {
  const securityToken = req.query.securityToken;

  usersController.validateResetPWLink(securityToken, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "Pin not found") {
        res.status(404).send(results);
      } else if (results.message && results.message == "Pin expired") {
        res.status(401).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// This API should be called when user resets password successfully
// For the deletion of expired passwords, it should be under a cron job
// DELETE /users/deleteResetPin
router.delete("/deleteResetPWPin", (req, res, next) => {
  const userId = req.body.userId;

  usersController.deleteResetPWPin(userId, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "No pin found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

/*

Split updating of details into three parts: NOTE

1. updateUserDetails (username and useremail)
2. updateUserImage (profile image)
3. updatePassword (password)

*/

// After the update of password, this API should be called to update the password
// At the same time, security token used to reset password should be deleted too
// PUT /users/updatePW
router.put("/updatePW", (req, res, next) => {
  const userDetails = {
    userId: req.body.userId,
    userPassword: req.body.userPassword,
  };

  usersController.updatePW(userDetails, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "User not found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// PUT /users/updateDetails
router.put("/updateUserDetails", (req, res, next) => {
  const userDetails = {
    userId: req.body.userId,
    userName: req.body.userName,
    userEmail: req.body.userEmail,
  };

  usersController.updateUserDetails(userDetails, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (
        results.message &&
        (results.message == "Email already in use" ||
          results.message == "User name already in use")
      ) {
        res.status(422).send(results);
      } else if (results.message && results.message == "User not found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// PUT /users/updateUserImage
router.put("/updateUserImage", (req, res, next) => {
  const userDetails = {
    userId: req.body.userId,
    userOldImageUrl: req.body.userOldImageUrl,
    userNewImageUrl: req.file.path,
  };

  usersController.updateUserImage(userDetails, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "User not found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// DELETE /users/deleteUserImage
router.put("/deleteUserImage", (req, res, next) => {
  const userDetails = {
    userId: req.body.userId,
    userOldImageUrl: req.body.userOldImageUrl,
  };

  usersController.deleteUserImage(userDetails, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "User not found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

module.exports = router;
