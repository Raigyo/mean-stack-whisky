const express = require("express");
const router = express.Router();
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

module.exports = router;
