/*
File Purpose: Create scheduled tasks to run at the background periodically.
Tasks includes: 
1) Updating of product prices
2) Monitoring of wishlist items
*/

const cron = require("node-cron");
const dbconnect = require("../middlewares/dbconfig");

// Insert new data rows for each product every 15mins STEP
// Runs at 59min of each hour, from day 1 - 31 of each month NOTE
const updateProductPrices = cron.schedule("*/59 * 1-31 * *", () => {
  // Get database connection and create a connection STEP
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    // If error, log error and terminate function STEP
    if (err) {
      console.log(err);
      return;
    }
  });

  // Update the different category depending on time of the day STEP
  const currentHour = new Date().getHours();
  let currentCategory;

  // frum 0000-0500, update category 1
  if (currentHour <= 5) {
    currentCategory = 1;
  }

  // from 0500-1000, update category 2
  else if (currentHour <= 10) {
    currentCategory = 2;
  }

  // from 1000-1500, update category 3
  else if (currentHour <= 15) {
    currentCategory = 3;
  }

  // from 1500-2000, update category 4
  else if (currentHour < 20) {
    currentCategory = 4;
  }

  // from 2000-2400, update category 5
  else if (currentHour < 24) {
    currentCategory = 5;
  }

  // Get all product_ids and latest price inside the current desired category STEP
  let sqlQuery =
    "SELECT product_id AS product_id, price_price AS product_price, MAX(price_timestamp) AS product_timestamp FROM products\
    LEFT JOIN prices\
    ON products.product_id = prices.price_product_id\
    WHERE products.category_id = ?\
    GROUP BY product_id;";

  conn.query(sqlQuery, [currentCategory], (err, result) => {
    // If error, log error and terminate function STEP
    if (err) {
      console.log(err);
      return;
    }

    // console.log(result);

    // Generate the new timestamp and prices and save it into a new array STEP
    const updatedDetailsArr = result.map((productDetails) => {
      const minProductPrice = productDetails.product_price * 0.8;
      const maxProductPrice = productDetails.product_price * 1.2;

      return {
        product_id: productDetails.product_id,
        product_timestamp: Math.floor(Date.now() / 1000),
        product_price: Math.floor(
          Math.random() * (maxProductPrice - minProductPrice) + minProductPrice
        ),
      };
    });

    // Format the data into a single 1D array STEP
    let finalDetailsArr = [];
    for (i = 0; i < updatedDetailsArr.length; i++) {
      finalDetailsArr = [
        ...finalDetailsArr,
        updatedDetailsArr[i].product_id,
        updatedDetailsArr[i].product_timestamp,
        updatedDetailsArr[i].product_price,
      ];
    }

    // console.log(finalDetailsArr);

    // Update prices of the selected specific products STEP
    sqlQuery =
      "INSERT INTO prices (price_product_id, price_timestamp, price_price) VALUES (?,?,?),(?,?,?),(?,?,?),(?,?,?),(?,?,?),(?,?,?),(?,?,?),(?,?,?)";

    conn.query(sqlQuery, finalDetailsArr, (err, result) => {
      conn.end();

      if (err) {
        console.log(err);
        return;
      }

      // If successful,
      console.log("Success");
      // console.log(result);
    });
  });
});
