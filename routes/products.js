/*
    File Purpose: 
*/

const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");

// GET / products / getCategories

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

// GET / Products / getItemsByCategory
// get back all products in the category
// get all products' details
// Image, name, platform, price

// SELECT * from products where categoryID = query_category

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

// GET / products / searchItem
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

// LEFTOFFAT

// GET / products / getItemDetails
// Product name, description, quantity, price, platform
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

/*

// GET / products / getPrices
router.get("/getPrices", (req, res, next) => {
  const input = {
    productName: req.query.productName,
  };

  productController.getPrices((err, results) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      if (results.message == "No Price Data Found") {
        res.status(404).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  });
});

*/

// POST / products / updateProductDetails

// router.post("/updateProductDetails", (req,res,next) => {
//     const input = {
//         productPrice : req.body.productPrice,
//         productName : req.body.productName,
//         productID : req.body.productID,
//         productQty : req.body.productQty
//     }

//     productController.updateProductDetails(input, (err,results) => {
//         if (err)
//         {
//             res.status(501).send({ message: "Internal Server Error" })
//         }

//         else
//         {
//             res.status(201).send(results)
//         }
//     })
// })

module.exports = router;
