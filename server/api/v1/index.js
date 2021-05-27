require("dotenv").config();
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const Blogpost = require("../models/blogpost");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// CREATE

router.post("/blog-posts", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      result: "KO",
      msg: "You are not authorized to create a blog post",
    });
  }

  console.log("blogPost:", req.body);
  const blogPost = new Blogpost({
    ...req.body,
    image: lastUploadedImageName,
  });
  blogPost.save((err, blogPost) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(201).json(blogPost);
    lastUploadedImageName = "";
  });
});

// File upload configuration
// Cloudinary
let lastUploadedImageName = "";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "image/upload/mean-dev-blog/",
  params: {
    folder: "mean-dev-blog",
    allowedFormats: ["jpg", "jpeg", "png", "gif"],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1 MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .gif, .jpg and .jpeg format allowed!"));
    }
  },
}).single("blogimage");

// File upload route
router.post("/blog-posts/images", (req, res) => {
  upload(req, res, function (error) {
    if (error) {
      if (error.code == "LIMIT_FILE_SIZE") {
        error.msg = "File Size is too large. Allowed file size is 1MB";
        return res.status(415).send(error.msg);
      } else {
        return res.status(415).send(error.msg);
      }
    }
    lastUploadedImageName = req.file.path.substr(
      req.file.path.lastIndexOf("/") + 1
    );
    console.log("lastUploadedImageName", lastUploadedImageName);
    res.status(201).send({ fileName: req.file.filename, file: req.file });
  });
});

// READ

router.get("/ping", (req, res) => {
  res.status(200).json({ msg: "pong", date: new Date() });
});

router.get("/blog-posts", (req, res) => {
  // console.log("req.user:", req.user); // test which is loggued
  Blogpost.find()
    .sort({ createdOn: -1 })
    .exec()
    .then((blogPosts) => res.status(200).json(blogPosts))
    .catch((err) =>
      res.status(500).json({
        msg: "blog posts not found",
        error: err,
      })
    );
});

router.get("/blog-posts/admin", (req, res) => {
  const userName = req.user.username;
  if (userName) {
    const userStatus = req.user.status;
    if (userStatus === "admin") {
      Blogpost.find()
        .sort({ createdOn: -1 })
        .exec()
        .then((blogPosts) => res.status(200).json(blogPosts))
        .catch((err) =>
          res.status(500).json({
            msg: "blog posts not found",
            error: err,
          })
        );
    }
    if (userStatus === "author") {
      Blogpost.find({ creator: userName })
        .sort({ createdOn: -1 })
        .exec()
        .then((blogPosts) => res.status(200).json(blogPosts))
        .catch((err) =>
          res.status(500).json({
            msg: "blog posts not found",
            error: err,
          })
        );
    }
  } else {
    console.log("front end redirect to auth");
  }
});

router.get("/blog-posts/:id", (req, res) => {
  const id = req.params.id;
  Blogpost.findById(id)
    .then((blogPostById) => res.status(200).json(blogPostById))
    .catch((err) =>
      res.status(500).json({
        msg: `blog post with id ${id} not found`,
        error: err,
      })
    );
});

// UPDATE

router.put("/blog-posts/:id", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      result: "KO",
      msg: "You are not authorized to edit a blog post",
    });
  } else {
    // console.log("res:", res);
    const id = req.params.id;
    const imageName = req.body.image;

    lastUploadedImageName = imageName.substr(imageName.lastIndexOf("/") + 1);

    // Delete older files in uploads
    Blogpost.findById(id, (err, res) => {
      const previousImage = res.image;
      console.log("updated image name: ", lastUploadedImageName);
      console.log("previous image name:", previousImage);
      // If it's a new image we delete the previous one in UPLOADS
      if (previousImage !== imageName) {
        cloudinary.uploader.destroy(
          process.env.FILE_UPLOAD_DIR + path.parse(previousImage).name,
          function (error, result) {
            console.log(result, error);
          }
        );
      }
    });
    // Images uploads + update datas
    const conditions = { _id: id };
    const blogPost = {
      ...req.body,
      image: lastUploadedImageName,
    };
    const update = { $set: blogPost };
    const options = {
      upsert: true, // if document exists: update, else create
      new: true, // return modified document
    };
    Blogpost.findOneAndUpdate(conditions, update, options, (err, response) => {
      if (err)
        return res.status(500).json({ msg: "update failed", error: err });
      res
        .status(200)
        .json({ msg: `document with id ${id} updated`, response: response });
    });
  }
});

// DELETE

// Delete one file by ID
router.delete("/blog-posts/:id", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      result: "KO",
      msg: "You are not authorized to delete a blog post",
    });
  }
  const id = req.params.id;
  // Delete files on cloudinary
  Blogpost.findById(id, function (err, res) {
    console.log("res.image", path.parse(res.image).name);
    cloudinary.uploader.destroy(
      process.env.FILE_UPLOAD_DIR + path.parse(res.image).name,
      function (error, result) {
        console.log(result, error);
      }
    );
  });
  // Delete in DB
  Blogpost.findByIdAndDelete(id, (err, blogPostDeletedById) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(200).json({
      msg: `blog post with id ${blogPostDeletedById._id} deleted`,
    });
  });
});

// Delete several files by IDs
router.delete("/blog-posts", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      result: "KO",
      msg: "You are not authorized to delete blogs posts",
    });
  }
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
  // Delete files on cloudinary
  allIds.forEach((item) => {
    // console.log(item, index);
    Blogpost.findById(item, function (err, res) {
      cloudinary.uploader.destroy(
        process.env.FILE_UPLOAD_DIR + path.parse(res.image).name,
        function (error, result) {
          console.log(result, error);
        }
      );
    });
  });
  // Delete in DB
  const condition = { _id: { $in: allIds } };
  Blogpost.deleteMany(condition, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(202).json(result);
  });
});

module.exports = router;
