/*
File Purpose: Initialise email transporter to send out emails using nodemailer and Gmail with OAuth2
*/

const nodemailer = require("nodemailer");

const {
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  OAUTH_CLIENTID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN,
} = require("../config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
    clientId: OAUTH_CLIENTID,
    clientSecret: OAUTH_CLIENT_SECRET,
    refreshToken: OAUTH_REFRESH_TOKEN,
  },
});

module.exports = transporter;
