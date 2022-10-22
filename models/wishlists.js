/*
File Purpose: This file handles the retrieval/ updating of data as requested by
the routed API endpoints pertaining to wishlists
*/

const dbconnect = require("../middlewares/dbconfig");

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
