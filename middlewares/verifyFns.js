/*
File Purpose: To provide a way to verify if users are authenticated beore proceeding with API
*/

const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../config");

const verifyToken = (req, res, next) => {
  // Extract the token from headers STEP
  /*
        req.headers: {
            authorization: "Bearer <JWT token>"
        }
    */
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If the token is not present, user is unauthenticated and return
  // error status code STEP
  if (token == undefined) {
    return res.status(401).send({ message: "No JWT" });
  }

  // Verify JWT
  // If JWT cannot be verified, return unauthenticated STEP
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, results) => {
    if (err) {
      return res.status(403).send({ message: "Invalid JWT" });
    }

    // if current user id is not the same as the user id stored in the jwt token,
    // return unauthenticated error STEP
    if (req.body.userId && req.body.userId != results.userId) {
      return res.status(403).send({ message: "Incorrect user" });
    }

    // ELse, attach userId to req object and pass on to next middleware STEP
    next();
  });
};

module.exports = { verifyToken };
