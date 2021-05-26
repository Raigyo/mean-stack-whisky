const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const passwordValidator = require("password-validator");

// Password validator schema with properties
const schema = new passwordValidator();
schema
  .is()
  .min(8) // Minimum length 8
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .not()
  .spaces(); // Should not have spaces

router.get("/users", (req, res) => {
  // console.log("req", req);
  User.find()
    .sort({ createdOn: -1 })
    .exec()
    .then((users) => res.status(200).json(users))
    .catch((err) =>
      res.status(500).json({
        msg: "users not found",
        error: err,
      })
    );
});

router.post("/register", async (req, res) => {
  console.log("user from req.body >>>", req.body);
  if (!schema.validate(req.body.password)) {
    return res.status(401).json({
      msg: "Password must contain at least 8 characters with uppercase and lowercase. Spaces are not allowed.",
    });
  }

  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    status: "author",
  });
  newUser.save((err, user) => {
    if (err) {
      // console.log("log:", err.errors.username.kind);
      if (err.errors.username.kind === "unique") {
        return res.status(401).json({
          msg: "User already exists.",
        });
      } else {
        return res.status(500).json({
          msg: "Something went wrong.",
        });
      }
    }
    // we login the user that has just been created
    req.logIn(req.body, (err) => {
      if (err) {
        console.error("err in register | req.logIn()", err);
      }
    });
    res.status(201).json(user);
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/auth/success",
    failureRedirect: "/auth/failure",
  })
);

router.get("/success", (req, res) => {
  res.status(200).json({ msg: "Logged in", user: req.user });
});

router.get("/failure", (req, res) => {
  res.status(401).json({ msg: "Wrong user name or password!" });
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.status(200).json({ msg: "Logged out successfully" });
});

router.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  // console.log("delete by id", id);
  User.findByIdAndDelete(id, (err, users) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(202).json({ msg: `user post with id ${users._id} deleted` });
  });
});

module.exports = router;
