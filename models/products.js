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
    "SELECT category.category_id, category_name, category_imageurl, COUNT(*) AS category_productcount FROM category\
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
    "SELECT product_id, product_name, product_desc, product_platform, product_imageurl, product_qty, category_id, product_purchaseurl, price_price\
    FROM products AS p\
    INNER JOIN prices AS pr ON p.product_id = pr.price_product_id\
    WHERE p.category_id = ?\
    ORDER BY pr.price_timestamp DESC\
    LIMIT 8";

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

  let sqlQuery = `SELECT product_id, product_name, product_desc, product_platform, product_imageurl, product_qty, category_id, product_purchaseurl, price_price FROM products
  INNER JOIN
  (SELECT t1.* FROM prices t1
  JOIN (SELECT price_product_id, MAX(price_timestamp) price_timestamp, price_price FROM prices GROUP BY price_product_id) t2
  ON t1.price_product_id = t2.price_product_id AND t1.price_timestamp = t2.price_timestamp)
  AS latestPrices
  ON products.product_id = 
  latestPrices.price_product_id AND
  product_name LIKE '%${productName}%';`;

  conn.query(sqlQuery, [], (err, result) => {
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

  let sqlQuery =
    "SELECT product_id, product_name, product_desc, product_platform, product_imageurl, product_qty, category_id, product_purchaseurl, price_price FROM products\
  INNER JOIN (\
  SELECT * FROM prices WHERE price_product_id = ?\
  ORDER BY price_timestamp DESC LIMIT 1\
  ) AS latest_price\
  WHERE products.product_id = latest_price.price_product_id";

  conn.query(sqlQuery, [productId], (err, result) => {
    conn.end();
    if (err) {
      return callback(err, null);
    }

    if (result.length == 0) {
      return callback(null, { message: "No Product Found" });
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
