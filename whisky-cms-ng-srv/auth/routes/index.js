const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const argon2 = require("argon2");

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
  // const newUser = new User(req.body);
  const passwordHashed = await argon2.hash(req.body.password);
  const newUser = await User.create({
    username: req.body.username,
    password: passwordHashed,
    status: "author",
  });
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
  res.status(401).json({ msg: "Wrong user name or password!" });
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.status(200).json({ msg: "logged out successfully" });
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
