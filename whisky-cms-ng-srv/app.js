const express = require("express");
const app = express();
const api = require("./api/v1/index");
const cors = require("cors");

app.set("port", process.env.port || 3000);

// Middlewares
app.use(cors());
// app.use((req, res, next) => {
//   console.log(`req handled at ${new Date()}`);
//   next();
// });
app.use((req, res) => {
  const err = new Error("404 - Not found !!!!!");
  err.status = 404;
  res.json({ msg: "404 - Not found !!!!!", err: err });
});
app.use("/api/v1", api);

app.listen(app.get("port"), () => {
  console.log(`express listen to port ${app.get("port")}`);
});
