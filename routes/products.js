/*
    File Purpose: 
*/

const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");

// GET /products/getCategories
router.get("/getCategories", (req, res, next) => {
  productController.getCategories((err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message === "No Categories Found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// GET /products/getItemsByCategory
router.get("/getItemsByCategory", (req, res, next) => {
  const input = {
    cat: req.query.cat,
  };

  productController.getItemsByCategory(input, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message === "No Products Found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// GET /products/searchItem
router.get("/searchItem", (req, res, next) => {
  const input = {
    productName: req.query.productName,
    categoryId: req.query.categoryId,
  };

  productController.searchItem(input, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "Invalid Search") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

// GET /products/getItemDetails
router.get("/getItemDetails", (req, res, next) => {
  const productId = req.query.productId;

  productController.getItemDetails(productId, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      res.status(200).send(results);
    }
  });
});

// GET /products/getPrices
router.get("/getPrices", (req, res, next) => {
  const productDetails = {
    productName: req.query.productName,
    timeStampLimit: req.query.timeStampLimit,
  };

  productController.getPrices(productDetails, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message && results.message == "No Price Data Found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

module.exports = router;
