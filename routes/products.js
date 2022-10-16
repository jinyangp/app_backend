/*
    File Purpose: 
*/


const { Router } = require("express")
const express = require("express")
const router = express.Router()
const productController = require("../controllers/products")

// GET / products / getCategories

router.get("/getCategories", (req,res,next) => {

    productController.getCategories((err, results) => {
        if (err)
        {
            res.status(500).send({ message: "Internal Server Error" })
        }
        else
        {
            if (results.message && results.message === "No Categories Found")
            {
                res.status(404).send(results)
            }
            else
            {
                res.status(200).send(results)
            }
        }
    })
})

// GET / Products / getItemsByCategory
// get back all products in the category
// get all products' details
// Image, name, platform, price


// SELECT * from products where categoryID = query_category


router.get("/getItemsByCategory", (req,res,next) => {
    const input = {
        cat: req.query.cat // Unsure about this query
    }

    productController.getItemsByCategory(input, (err,results) => {
        if (err)
        {
            res.status(500).send({ message: "Internal Server Error" })

        }
        else
        {
            if (results.message == "No Products Found")
            {
                res.status(404).send(results)
            }
            else
            {
                res.status(200).send(results)
            }
        }
    })
})


// GET / products / searchItem
// Get back product details based on search query, and if they indicated a category to search from
// Read up on SQL Like Operator [ 'like,%' ]
router.get("/searchItem", (req,res,next) => {
    const input = {
        productName: req.query.productName,
        searchByCat_ID: req.query.searchByCat_ID
    }

    productController.searchItem(input, (err,results) => {
        if (err)
        {
            res.status(500).send({ message: "Internal Server Error" })
        }

        else
        {
            if (results.message == "Invalid Search")
            {
                res.status(404).send(results)
            }
            else
            {
                res.status(200).send(results)
            }
        }
    })
})

// GET / products / getItemDetails
// Product name, description, quantity, price, platform
router.get("/getItemDetails", (req,res,next) => {
    const input = {
        heading : req.query.heading
    }

    productController.getItemDetails(input, (err,results) => {
        if (err)
        {
            res.status(500).send({ message: "Internal Server Error" })
        }

        else
        {   
            res.status(200).send(results)   
        }
    })
})

// GET / products / getPrices
// LOW-PRIORITY
router.get("/getPrices", (req,res,next) => {
    const input = {
        productName : req.query.productName
    }

    productController.getPrices((err,results) => {
        if (err)
        {
            res.status(500).send({ message: "Internal Server Error" })
        }

        else
        {
            if (results.message == "No Price Data Found")
            {
                res.status(404).send(results)
            }
            else
            {
                res.status(200).send(results)
            }
        }
    })
})

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

module.exports = router