/*
File Purpose: Retrieves env variables from .env file to be used in other parts
of backend
*/

const dotenv = require("dotenv");
const configs = dotenv.config();

if (configs.error) {
  throw configs.error;
}

const { parsed: envs } = configs;

module.exports = envs;
