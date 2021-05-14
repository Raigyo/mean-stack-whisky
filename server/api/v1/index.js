require("dotenv").config();
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
// const readChunk = require("read-chunk");
// const fileType = require("file-type");
const fs = require("fs");

const resize = require("../../utils/resize");

const Blogpost = require("../models/blogpost");

// CREATE

router.post("/blog-posts", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      result: "KO",
      msg: "You are not authorized to edit a blog post",
    });
  }
  const smallImagePath = `./uploads/${lastUploadedImageName}`;
  const outputName = `./uploads/small-${lastUploadedImageName}`;
  console.log("lastUploadedImageName:", lastUploadedImageName);
  resize({
    path: smallImagePath,
    width: 200,
    height: 200,
    outputName: outputName,
  })
    .then((data) => {
      console.log("OK resize", data.size);
    })
    .catch((err) => console.error("err from resize", err));
  console.log("blogPost:", req.body);
  const blogPost = new Blogpost({
    ...req.body,
    image: lastUploadedImageName,
    smallImage: `small-${lastUploadedImageName}`,
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
let lastUploadedImageName = "";
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, callback) {
    console.log("filename", file);
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return callback(err);
      lastUploadedImageName =
        raw.toString("hex") + path.extname(file.originalname);
      callback(null, lastUploadedImageName);
    });
    // lastUploadedImageName =
    //   file.originalname + +path.extname(file.originalname);
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
  console.log(req.file);
  upload(req, res, function (error) {
    if (error) {
      if (error.code == "LIMIT_FILE_SIZE") {
        error.msg = "File Size is too large. Allowed file size is 1MB";
        return res.status(415).send(error.msg);
      } else {
        return res.status(415).send(error.msg);
      }
    }
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
  // console.log("Admin route/user:", req.user.username); // test which is loggued
  // const userName = req.user.username;
  // const userStatus = req.user.status;
  // if (userStatus === "admin") {
  //   Blogpost.find()
  //     .sort({ createdOn: -1 })
  //     .exec()
  //     .then((blogPosts) => res.status(200).json(blogPosts))
  //     .catch((err) =>
  //       res.status(500).json({
  //         msg: "blog posts not found",
  //         error: err,
  //       })
  //     );
  // }
  // if (userStatus === "author" && userName !== undefined) {
  //   Blogpost.find({ creator: userName })
  //     .sort({ createdOn: -1 })
  //     .exec()
  //     .then((blogPosts) => res.status(200).json(blogPosts))
  //     .catch((err) =>
  //       res.status(500).json({
  //         msg: "blog posts not found",
  //         error: err,
  //       })
  //     );
  // }
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
    // Delete older files in uploads
    Blogpost.findById(id, (err, res) => {
      const previousImage = res.image;
      // console.log("Image name: ", imageName);
      // console.log("Previous image:", previousImage);
      // If it's a new image we delete the previous one in UPLOADS
      if (previousImage !== imageName) {
        const filesToDelete = [
          `./uploads/${previousImage}`,
          `./uploads/small-${previousImage}`,
        ];
        deleteFiles(filesToDelete, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Older images removed after update");
          }
        });
      }
    });
    // Images uploads + update datas
    const smallImagePath = `./uploads/${imageName}`;
    const outputName = `./uploads/small-${imageName}`;
    resize({
      path: smallImagePath,
      width: 200,
      height: 200,
      outputName: outputName,
    })
      .then((data) => {
        console.log("OK resize", data.size);
      })
      .catch((err) => console.error("err from resize", err));
    const conditions = { _id: id };
    const blogPost = {
      ...req.body,
      image: imageName,
      smallImage: `small-${imageName}`,
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

// Helper: Delete files in UPLOADs
const deleteFiles = (files, callback) => {
  var i = files.length;
  files.forEach((filepath) => {
    fs.unlink(filepath, function (err) {
      i--;
      if (err) {
        callback(err);
        return;
      } else if (i <= 0) {
        callback(null);
      }
    });
  });
};

router.delete("/blog-posts/:id", (req, res) => {
  // console.log("req.isAuthenticated()", req.isAuthenticated());
  // req.logOut();
  // console.log("req.isAuthenticated()", req.isAuthenticated());
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      result: "KO",
      msg: "You are not authorized to delete a blog post",
    });
  }
  const id = req.params.id;
  // Delete files in uploads
  Blogpost.findById(id, function (err, res) {
    const filesToDelete = [`uploads/${res.image}`, `uploads/${res.smallImage}`];
    deleteFiles(filesToDelete, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("All files removed");
      }
    });
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

// Delete several ids sent from front-end
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
  // Delete files in uploads
  allIds.forEach((item) => {
    // console.log(item, index);
    Blogpost.findById(item, function (err, res) {
      const filesToDelete = [
        `uploads/${res.image}`,
        `uploads/${res.smallImage}`,
      ];
      deleteFiles(filesToDelete, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("All files removed");
        }
      });
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
