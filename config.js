const dotenv = require("dotenv");
const configs = dotenv.config();

if (configs.error) {
  throw configs.error;
}

const { parsed: envs } = configs;

module.exports = envs;
