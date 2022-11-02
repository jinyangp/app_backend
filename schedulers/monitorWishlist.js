/*
File Purpose: To periodically monitor the wishlist to send out notifications
*/

const cron = require("node-cron");
const dbconnect = require("../middlewares/dbconfig");
const transporter = require("../middlewares/emailconfig");
const { FRONTEND_URL_DEV, FRONTEND_URL_PROD } = require("../config");

/*
Steps to monitor wishlist:

Step 1: STEP
1) Get all the latest prices
2) Check against the wishlists
=> Return a list of users, with their user_id and email

Step 2: STEP
1) Create a notification for each of these users
2) Send out an email for each of these users
*/

const monitorWishlist = cron.schedule("*/10 * * * * *", () => {
  const conn = dbconnect.getConnection();

  conn.connect((err) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  let notifiableItems = [];

  // To merge with wishlist to get all wishlist items where current price <= target price,
  // and merge with users table to get all rows with the involved users STEP
  let sqlQuery =
    "SELECT wishlist_id, wishlist_user_id, wishlist_product_id, product_name, product_platform, target_price, price_price, user_email, user_name FROM wishlist_items\
    INNER JOIN (\
    SELECT t1.* FROM prices t1\
      JOIN (SELECT price_product_id, MAX(price_timestamp) price_timestamp, price_price FROM prices GROUP BY price_product_id) t2\
      ON t1.price_product_id = t2.price_product_id AND t1.price_timestamp = t2.price_timestamp\
    ) AS latest_prices\
    ON latest_prices.price_product_id = wishlist_items.wishlist_product_id AND latest_prices.price_price <= wishlist_items.target_price\
    INNER JOIN products\
    ON wishlist_items.wishlist_product_id = products.product_id\
    INNER JOIN users\
    ON users.user_id = wishlist_items.wishlist_user_id\
    WHERE (wishlist_items.wishlist_product_id, wishlist_items.wishlist_user_id) NOT IN\
    (SELECT notif_product_id, notif_user_id FROM notif_items);";

  conn.query(sqlQuery, [], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    // If no wishlist items need to be notified, return immediately STEP
    if (result.length == 0) {
      console.log("No wishlist items to notify");
      return;
    }

    notifiableItems = result;

    // Format details to be included in notif_items table STEP
    const notifDetails = [];
    for (let i = 0; i < result.length; i++) {
      notifDetails.push([
        result[i].wishlist_user_id,
        result[i].wishlist_product_id,
        "Target price has been reached! Check it out now!",
        new Date(),
        0,
      ]);
    }

    // Else, proceed to create a new notification item for each of the notifiable
    // wishlist item STEP
    sqlQuery =
      "INSERT INTO notif_items (notif_user_id, notif_product_id, notif_message, notif_timestamp, notif_read) VALUES ?";

    conn.query(sqlQuery, [notifDetails], (err, result) => {
      conn.end();

      if (err) {
        console.log(err);
        return;
      }

      // Adding to notif_items table succeeds STEP
      //   console.log("Add to notification item table succeeds");

      // Next, send an email out to all notifiable wishlist items STEP
      for (let notif of notifiableItems) {
        const mailOptions = {
          from: "PriceFix <pricefix.noreply@gmail.com>",
          to: notif.user_email,
          subject: `Target Price for ${notif.product_name} reached`,
          html: `

        <p>Dear ${notif.user_name},</p>
        <p>The target price you have set for ${notif.product_name} selling on ${notif.product_platform} has been reached!</p>
        <p>Check it out now: ${FRONTEND_URL_PROD}/item-details/${notif.wishlist_product_id}</p>
        Best Wishes, <br/>
        <p>PriceFix</p>
        `,
        };

        transporter.sendMail(mailOptions, function (err, data) {
          if (err) {
            console.log(err);
            return;
          }
        });
      }
    });
  });
});
