// config.js
const dotenv = require("dotenv");
const path = require("path");
console.log(process.env.NODE_ENV);
dotenv.config({
  path: path.resolve(__dirname, ".env." + process.env.NODE_ENV),
});
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  MOONGOOSE_CONNECT: process.env.MOONGOOSE_CONNECT,
  FILE_UPLOAD_DIR: process.env.FILE_UPLOAD_DIR,
};
