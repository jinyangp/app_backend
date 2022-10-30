/*
File Purpose: This file handles the retrieval/ updating of data as requested by
the routed API endpoints pertaining to wishlists
*/

const dbconnect = require("../middlewares/dbconfig");

exports.getWishListItem = (userId, callback) => {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  let sqlQuery = `SELECT product_id, product_name, product_desc, product_platform, product_imageurl, product_qty, category_id, product_purchaseurl, target_price, price_price FROM products\
  INNER JOIN (\
  SELECT wishlist_product_id AS pid, target_price FROM wishlist_items WHERE wishlist_user_id = ?\
  )\
  AS users_wl ON products.product_id = users_wl.pid\
  INNER JOIN (\ 
  SELECT t1.* FROM prices t1\
  JOIN (SELECT price_product_id, MAX(price_timestamp) price_timestamp, price_price FROM prices GROUP BY price_product_id) t2\
  ON t1.price_product_id = t2.price_product_id AND t1.price_timestamp = t2.price_timestamp\
  ) AS latest_prices\
  ON products.product_id = latest_prices.price_product_id`;

  conn.query(sqlQuery, [userId], (err, result) => {
    conn.end();

    if (err) {
      return callback(err, null);
    }

    if (result.length == 0) {
      return callback(null, { message: "No wishlist items" });
    }

    return callback(null, result);
  });
};

exports.addWishListItem = (details, callback) => {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  const userId = details.userId;
  const productId = details.productId;
  const targetPrice = details.targetPrice;

  let sqlQuery =
    "INSERT INTO wishlist_items (wishlist_user_id, wishlist_product_id, target_price) VALUES (?, ?, ?)";

  conn.query(sqlQuery, [userId, productId, targetPrice], (err, result) => {
    conn.end();

    if (err) {
      return callback(err, null);
    }

    if (result.affectedRows == 1) {
      return callback(null, { message: "Wishlist item added" });
    }
  });
};

exports.removeWishlistItem = (details, callback) => {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  const userId = details.userId;
  const productId = details.productId;

  let sqlQuery =
    "DELETE FROM wishlist_items WHERE wishlist_user_id = ? AND wishlist_product_id = ?";

  conn.query(sqlQuery, [userId, productId], (err, result) => {
    conn.end();

    if (err) {
      return callback(err, null);
    }

    if (result.affectedRows == 0) {
      return callback(null, { message: "No such wishlist item found" });
    }

    return callback(null, { message: "Wishlist item deleted" });
  });
};

exports.updateTargetPrice = (details, callback) => {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  const userId = details.userId;
  const productId = details.productId;
  const newTargetPrice = details.newTargetPrice;

  let sqlQuery =
    "UPDATE wishlist_items SET target_price = ? WHERE wishlist_user_id = ? AND wishlist_product_id = ?";

  conn.query(sqlQuery, [newTargetPrice, userId, productId], (err, result) => {
    conn.end();

    if (err) {
      return callback(err, null);
    }

    if (result.affectedRows == 0) {
      return callback(null, { message: "No such wishlist item found" });
    }

    return callback(null, { message: "Target price updated" });
  });
};

exports.getNotifications = (userId, callback) => {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  let sqlQuery =
    "SELECT notif_item_id, notif_user_id, notif_product_id, notif_message, notif_timestamp, notif_read, product_imageurl FROM notif_items\
  INNER JOIN products\
  ON notif_items.notif_product_id = products.product_id AND notif_items.notif_user_id = ?";

  conn.query(sqlQuery, [userId], (err, result) => {
    conn.end();

    if (err) {
      return callback(err, null);
    }

    if (result.length == 0) {
      return callback(null, { message: "No notifications" });
    }

    return callback(null, result);
  });
};

exports.markNotificationAsRead = (notifId, callback) => {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      return callback(err, null);
    }
  });

  let sqlQuery = "UPDATE notif_items SET notif_read = 1 WHERE	notif_item_id = ?";

  conn.query(sqlQuery, [notifId], (err, result) => {
    conn.end();

    if (err) {
      return callback(err, null);
    }

    if (result.affectedRows == 0) {
      return callback(null, { message: "No such notification" });
    }

    return callback(null, { message: "Success" });
  });
};
