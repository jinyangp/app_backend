const mysql = require("mysql");
const { DB_HOSTNAME, DB_USER, DB_PW } = require("../config");

const dbconnect = {
  getConnection: mysql.createConnection({
    host: DB_HOSTNAME,
    user: DB_USER,
    password: DB_USER,
  }),
};

module.exports = dbconnect;
