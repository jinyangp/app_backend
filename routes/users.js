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

module.exports = router;
