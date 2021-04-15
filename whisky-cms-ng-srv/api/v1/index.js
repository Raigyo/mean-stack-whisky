const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const Blogpost = require("../models/blogpost");

router.get("/ping", (req, res) => {
  res.status(200).json({ msg: "pong", date: new Date() });
});

router.get("/blog-posts", (req, res) => {
  Blogpost.find()
    .sort({ createdOn: -1 })
    .exec()
    .then((blogPosts) => res.status(200).json(blogPosts))
    .catch((err) =>
      res.status(500).json({
        message: "blog posts not found",
        error: err,
      })
    );
});

// file upload configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, callback) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return callback(err);
      callback(null, raw.toString("hex") + path.extname(file.originalname));
    });
  },
});
const upload = multer({ storage: storage });

// file upload route
router.post("/blog-posts/images", upload.single("blogimage"), (req, res) => {
  console.log("req.file", req.file);
  if (!req.file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return res.status(400).json({ msg: "only image files please" });
  }
  res.status(201).send({ fileName: req.file.filename, file: req.file });
});

// file upload
// router.post("/blog-posts/images", upload.single("blogimage"), (req, res) => {
//   res.status(201).send({ fileName: req.file.filename, file: req.file });
// });

router.post("/blog-posts", (req, res) => {
  const blogPost = new Blogpost(req.body);
  blogPost.save((err, blogPost) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(201).json(blogPost);
  });
});

router.get("/blog-posts/:id", (req, res) => {
  const id = req.params.id;
  Blogpost.findById(id)
    .then((blogPostById) => res.status(200).json(blogPostById))
    .catch((err) =>
      res.status(500).json({
        message: `blog post with id ${id} not found`,
        error: err,
      })
    );
});

router.delete("/blog-posts/:id", (req, res) => {
  const id = req.params.id;
  Blogpost.findByIdAndDelete(id, (err, blogPostDeletedById) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(202).json({
      message: `blog post with id ${blogPostDeletedById._id} deleted`,
    });
  });
});

// delete several ids sent from front-end
router.delete("/blog-posts", (req, res) => {
  const ids = req.query.ids;
  console.log("ids", ids);
  const allIds = ids.split(",").map((id) => {
    // cast string to check if it matches mongoose keys (ObjectId) and return bool
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // change string to ObjectId
      return mongoose.Types.ObjectId(id);
    } else {
      console.log("Id not valid!");
    }
  });
  const condition = { _id: { $in: allIds } };
  Blogpost.deleteMany(condition, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(202).json(result);
  });
});

module.exports = router;
