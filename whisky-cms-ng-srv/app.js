const express = require("express");
const app = express();
const api = require("./api/v1/index");
const auth = require("./auth/routes");
const cors = require("cors");
// Passport
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const Strategy = require("passport-local").Strategy;
// to retrieve users from the MongoDB users collection
const User = require("./auth/models/user");

// MIDDLEWARES
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res, next) => {
  console.log(`req handled at ${new Date()}`);
  next();
});

// User sessions
app.use(cookieParser());
//a session needs a secret to create a cookie
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "my super secret",
    name: "whisky-cookie",
  })
);
app.use(passport.initialize());
app.use(passport.session());
// passport will add a user to the session... (to cookie)
passport.serializeUser((user, cb) => {
  cb(null, user);
});
//...and retrieve it from session (from cookie)
passport.deserializeUser((user, cb) => {
  cb(null, user);
});
// configuring a local strategy
// == using username and password to identify and authorize a user
passport.use(
  new Strategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    (name, pwd, done) => {
      User.findOne({ username: name }, (err, user) => {
        if (err) {
          console.log(err);
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!pwd || user.password !== pwd) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      });
    }
  )
);

// Mongoose connect
const mongoose = require("mongoose");
const connection = mongoose.connection;

app.set("port", process.env.port || 3000);

// Set up static folders
const uploadsDir = require("path").join(__dirname, "/uploads"); // static documents directory
console.log(uploadsDir);
app.use(express.static(uploadsDir));

// Main routes
app.use("/api/v1", api);
app.use("/auth", auth);
app.use(express.static("static"));

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
  useFindAndModify: false,
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
