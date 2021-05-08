const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

router.get("/users", (req, res) => {
  console.log("req", req);
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

router.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  console.log("delete by id", id);
  User.findByIdAndDelete(id, (err, users) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(202).json({ msg: `user post with id ${users._id} deleted` });
  });
});

router.post("/register", (req, res) => {
  console.log("user from req.body >>>", req.body);
  const newUser = new User(req.body);
  newUser.save((err, user) => {
    if (err) {
      return res.status(500).json(err);
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
  res.status(200).json({ msg: "logged in", user: req.user });
});

router.get("/failure", (req, res) => {
  res.status(401).json({ msg: "NOT logged in" });
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.status(200).json({ msg: "logged out successfully" });
});

module.exports = router;
