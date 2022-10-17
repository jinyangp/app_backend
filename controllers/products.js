const dbconnect = require("../middlewares/dbconfig");

// GET /products/getCategories
exports.getCategories = function (callback) {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });
  let sqlQuery =
    "SELECT category_name, category_imageurl, COUNT(*) AS category_productcount FROM category\
        LEFT JOIN products\
        ON category.category_id = products.category_id\
        GROUP BY category.category_id";

  conn.query(sqlQuery, (err, result) => {
    conn.end();
    if (err) {
      return callback(err, null);
    }
    if (result.length == 0) {
      return callback(null, { message: "No Categories Found" });
    }

    return callback(null, result);
  });
};

// GET /products/getItemsByCategory
exports.getItemsByCategory = function (input, callback) {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  const category_id = input.cat;

  let sqlQuery =
    "SELECT product_id, product_name, product_desc, product_platform, product_imageurl, product_qty, category_id, product_purchaseurl, price_price FROM products\
    INNER JOIN\
    (SELECT price_price, price_product_id, MAX(price_timestamp) AS latest_timestamp FROM prices\
    GROUP BY price_product_id)\
    AS latestPrices\
    ON products.product_id = \
    latestPrices.price_product_id AND\
    products.category_id = ?";

  conn.query(sqlQuery, [category_id], (err, result) => {
    conn.end();
    if (err) {
      return callback(err, null);
    }
    if (result.length == 0) {
      return callback(null, { message: "No Products Found" });
    }

    return callback(null, result);
  });
};

// GET /products/searchItem
exports.searchItem = function (input, callback) {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  const productName = input.productName;
  const categoryId = input.categoryId;

  let sqlQuery = `SELECT product_id, product_name, product_desc, product_platform, product_imageurl, product_qty, category_id, product_purchaseurl, price_price FROM products\
  INNER JOIN\
  (SELECT price_price, price_product_id, MAX(price_timestamp) AS latest_timestamp FROM prices\
  GROUP BY price_product_id)\
  AS latestPrices\
  ON products.product_id = \
  latestPrices.price_product_id AND\
  products.category_id = ? AND\
  product_name LIKE '%${productName}%'`;

  conn.query(sqlQuery, [categoryId], (err, result) => {
    conn.end();
    if (err) {
      return callback(err, null);
    }

    if (result.length == 0) {
      return callback(null, { message: "Invalid Search" });
    }

    return callback(null, result);
  });
};

// GET /products/getItemDetails
exports.getItemDetails = function (productId, callback) {
  const conn = dbconnect.getConnection();
  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  let sqlQuery = "SELECT * FROM products WHERE product_id = ?";

  conn.query(sqlQuery, [productId], (err, result) => {
    conn.end();
    if (err) {
      return callback(err, null);
    }
    return callback(null, result);
  });
};

// GET /products/getPrices
exports.getPrices = function (productDetails, callback) {
  const conn = dbconnect.getConnection();
  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  const productName = productDetails.productName;
  const timeStampLimit = productDetails.timeStampLimit;

  let sqlQuery = `SELECT product_id, price_price, price_timestamp, product_name, product_platform FROM prices\
  INNER JOIN (\
  SELECT * FROM products WHERE product_name LIKE '%${productName}%'\
  ) AS matched_products\
  ON prices.price_product_id = matched_products.product_id\
  AND price_timestamp >= ?`;

  conn.query(sqlQuery, [timeStampLimit], (err, result) => {
    conn.end();
    if (err) {
      return callback(err, null);
    }

    if (result.length == 0) {
      return callback(null, { message: "No Price Data Found" });
    }

    return callback(null, result);
  });
};
