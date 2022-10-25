/*
File Purpose: This file handles the routing for API endpoints pertaining to wishlists
*/

const express = require("express");
const router = express.Router();
const wishlists = require("../models/wishlists");

const verifyFns = require("../middlewares/verifyFns");

// GET /wishlists/getWishlistItems
router.get("/getWishlistItems", verifyFns.verifyToken, (req, res, next) => {
  const userId = req.query.userId;

  wishlists.getWishListItem(userId, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "No wishlist items") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// POST /wishlists/addWishlistItem
router.post("/addWishlistItem", verifyFns.verifyToken, (req, res, next) => {
  // When adding to item's wishlist, need userId, productId and targetPrce STEP
  const details = {
    userId: req.body.userId,
    productId: req.body.productId,
    targetPrice: req.body.targetPrice,
  };

  // Call controller action STEP
  wishlists.addWishListItem(details, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "Wishlist item added") {
        res.status(201).send(results);
      }
    }
  });
});

// DELETE /wishlists/removeWishlistItem
router.delete(
  "/removeWishlistItem",
  verifyFns.verifyToken,
  (req, res, next) => {
    const details = {
      userId: req.body.userId,
      productId: req.body.productId,
    };

    wishlists.removeWishlistItem(details, (err, results) => {
      if (err) {
        res.status(500).send({ message: "Internal Server Error" });
      } else {
        if (
          results.message &&
          results.message == "No such wishlist item found"
        ) {
          res.status(404).send(results);
        } else {
          res.status(200).send(results);
        }
      }
    });
  }
);

// PUT /wishlists/updateTargetPrice
router.put("/updateTargetPrice", verifyFns.verifyToken, (req, res, next) => {
  const details = {
    userId: req.body.userId,
    productId: req.body.productId,
    newTargetPrice: req.body.newTargetPrice,
  };

  wishlists.updateTargetPrice(details, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "No such wishlist item found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

module.exports = router;
