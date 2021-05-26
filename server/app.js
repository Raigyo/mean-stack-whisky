const express = require("express");
const app = express();
const path = require("path");
// const envConfig = require("./config/envConfig");
const api = require("./api/v1/index");
const auth = require("./auth/routes");
// const cors = require("cors");

// Passport
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("cookie-session");
const Strategy = require("passport-local").Strategy;
// to retrieve users from the MongoDB users collection
const User = require("./auth/models/user");

// const HOST = process.env.HOST;
const PORT = process.env.PORT;
const MOONGOOSE_CONNECT = process.env.MOONGOOSE_CONNECT;
// const CORS_ORIGIN = process.env.CORS_ORIGIN;

// MIDDLEWARES
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
// app.use(cors({ credentials: true, origin: CORS_ORIGIN }));
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
    (name, password, done) => {
      User.findOne({ username: name }, (err, user) => {
        if (err) {
          console.log("Something went wront try again later");
          return done(null, false);
        }
        if (!user) {
          console.log("User doesn't exists in database!");
          return done(null, false);
        }
        user.validPassword(user.password, password).then((result) => {
          console.log("result", result);
          if (!result) {
            console.log("Incorrect password");
            return done(null, false, { message: "Incorrect password." });
          }
          console.log("Password matches");
          return done(null, user);
        });
      });
    }
  )
);

// Mongoose connect
const mongoose = require("mongoose");
const connection = mongoose.connection;

// app.set("port", process.env.PORT || 3000);

// Set up static folders
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/client")));
app.use(express.static(path.join(__dirname, "public/client/upload")));
// const uploadsDir = app.use(express.static(path.join(__dirname, "/uploads"))); // static documents directory
// app.use(express.static(uploadsDir));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/client/index.html"));
});
// Main routes
app.use("/api/v1", api);
app.use("/auth", auth);
// app.use(express.static("static"));

// app.get("/", (req, res) => {
//   res.send(`App listening on ${PORT}`);
// });

// 404 handling - don't put middlewares below
app.use((req, res) => {
  const err = new Error("404 - Not found !!!!!");
  err.status = 404;
  res.json({ msg: "404 - Not found !!!!!", err: err });
});

const run = async () => {
  await mongoose.connect(MOONGOOSE_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
};
run().catch((error) => console.error(error));

// EventEmitters
connection.on("error", (err) => {
  console.error(`connection to MongoDB error: ${err.message}`);
});
connection.once("open", () => {
  console.log("Connected to MongoDB");

  // app.listen(process.env.PORT, process.env.HOST, function () {
  //   console.log(`App listening on http://${HOST}:${PORT}`);
  //   console.log(process.env);
  // });
  app.listen(PORT || 3000);
});
