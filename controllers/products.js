// Request Messages --> Sent by User
// Response Messages --> Sent by Server

// Headers --> Meta info about request [ Key : Value pairs ] --> Can be sent as text or json, with UTF-8 encoding
// Response Message --> Status Code : Signals result of request
//                      Status Text : "OK", e.t.c
// Body --> To add resource onto Server [ A.K.A Payload ]
// Get --> Default Request
// Post
// Put
// Delete


// req => middleware => res
// Middleware is right in the middle of the request and response

const fs = require("fs")
const path = require("path")

const dbconnect = require("../middlewares/dbconfig")
const { ACCESS_TOKEN_SECRET } = require("../config")

// GET / products / getCategories
// should return category id, name, imageurl, and number of products in category
// join products and categories tables and count the number of rows [ Left-Join and Count ]

exports.getCategories = function(callback) {
    const conn = dbconnect.getConnection()

    conn.connect((err) => {
        if (err)
        {
            return callback(err,null)
        }
    })
        let sqlQuery = "SELECT category_name, category_imageurl, COUNT(*) AS category_productcount FROM category\
        LEFT JOIN products\
        ON category.category_id = products.category_id\
        GROUP BY category.category_id"
        
        conn.query(sqlQuery, (err,result) => {
            conn.end()
            if (err)
            {
                return callback(err, null)
            }
            if (result.length == 0)
            {
                return callback(null, {message: "No Categories Found"})
            }

            return callback(null, result)
        })
}
// getCategories is DONEE!!

exports.getItemsByCategory = function(input, callback) {
    const conn = dbconnect.getConnection()

    conn.connect((err) => {
        if (err)
        {
            return callback(err,null)
        }
    })

    const category_id = input.cat

    let sqlQuery = "SELECT product_id, product_name, product_desc, product_platform, product_imageurl, product_qty, category_id, product_purchaseurl, price_price FROM products\
    INNER JOIN\
    (SELECT price_price, price_product_id, MAX(price_timestamp) AS latest_timestamp FROM prices\
    GROUP BY price_product_id)\
    AS latestPrices\
    ON products.product_id = \
    latestPrices.price_product_id AND\
    products.category_id = ?"

    conn.query(sqlQuery, (err,result) => {
        conn.end()
        if (err)
        {
            return callback(err, null)
        }
        if (result.length == 0)
        {
            return callback(null, {message: "No Categories Found"})
        }

        return callback(null, result)
    })

}

// getItemsbyCategory is DONEE!!

exports.searchItem = function(input, callback){
    const conn = dbconnect.getConnection()

    conn.connect((err) => {
        if (err)
        {
            return callback(err,null)
        }
    })

    const productName = input.searchByName
    const category_id = input.searchByCat_ID

    let sqlQuery = "SELECT * FROM products WHERE product_name LIKE '%?%' AND category_id = ?"

    conn.query(sqlQuery, [productName, category_id], (err,result) => {
        conn.end()
        if  (err)
        {
            return callback(err,null)
        }

        if (result.length == 0)
        {
            return callback(null, {message: "Invalid Search"})
        }

        return callback(null,result)

    })
}

exports.getItemDetails = function(input, callback){
    const conn = dbconnect.getConnection()
    conn.connect((err) => {
        if (err)
        {
            return callback(err,null)
        }
    })

    const heading = input.heading

    let sqlQuery = "SELECT * FROM products WHERE product_name LIKE '%heading%'"

    conn.query(sqlQuery, [heading], (err,result) => {
        conn.end()
        if  (err)
        {
            return callback(err,null)
        }

        if (result.length == 0)
        {
            return callback(null, {message: "Invalid Search"})
        }

        return callback(null,result)

    })
}

exports.getPrices = function(input,callback){
    const conn = dbconnect.getConnection()
    conn.connect((err) => {
        if (err)
        {
            return callback(err,null)
        }
    })

    const productName = input.productName

    let sqlQuery = "SELECT product_id FROM products\
    LEFT JOIN\
    (SELECT price_timestamp, price_price,price_product_id FROM prices\
    GROUP BY price_product_id)\
    AS priceInformation\
    ON products.product_id = \
    priceInformation.product_id\
    AND product_name = '%productName%'"

    conn.query(sqlQuery, [productName], (err,result) => {
        conn.end()
        if  (err)
        {
            return callback(err,null)
        }

        if (result.length == 0)
        {
            return callback(null, {message: "Invalid Search"})
        }

        return callback(null,result)

    })


}
