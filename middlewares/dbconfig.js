/*
File Purpose: Initialise connection to db
*/

const mysql = require("mysql");
const { DB_HOSTNAME, DB_USER, DB_PW, DB_NAME } = require("../config");

const dbconnect = {
  getConnection: () => {
    return mysql.createConnection({
      host: DB_HOSTNAME,
      user: DB_USER,
      password: DB_PW,
      database: DB_NAME,
    });
  },
};

module.exports = dbconnect;
