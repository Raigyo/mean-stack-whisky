const express = require("express");
const app = express();
const api = require("./api/v1/index");
const cors = require("cors");

const mongoose = require("mongoose");
const connection = mongoose.connection;

app.set("port", process.env.port || 3000);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res, next) => {
  console.log(`req handled at ${new Date()}`);
  next();
});
app.use("/api/v1", api);
const uploadsDir = require("path").join(__dirname, "/uploads"); // static documents directory
console.log(uploadsDir);
app.use(express.static(uploadsDir));
// 404 handling - don't put middlewares below
app.use((req, res) => {
  const err = new Error("404 - Not found !!!!!");
  err.status = 404;
  res.json({ msg: "404 - Not found !!!!!", err: err });
});

// Mongoose
mongoose.connect("mongodb://127.0.0.1:27017/whiskycms", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// EventEmitters
connection.on("error", (err) => {
  console.error(`connection to MongoDB error: ${err.message}`);
});
connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(app.get("port"), () => {
    console.log(`express listen to port ${app.get("port")}`);
  });
});
