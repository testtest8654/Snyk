const express = require("express");
const { AuthRequired } = require("../middleware/AuthMiddleware");
const fileUpload = require("express-fileupload");
const fs = require("fs/promises");
const path = require("path");
const { convert } = require("imagemagick-convert");
const { render } = require("../utils");
const ValidationMiddleware = require("../middleware/ValidationMiddleware");
const { randomBytes } = require("node:crypto");

const router = express.Router();
let db;

router.get("/", async function (req, res) {
  render(req, res, "forum.html", { posts: await db.getPosts() });
});

router.get("/new", AuthRequired, async function (req, res) {
  render(req, res, "new.html");
});

router.get("/post/:parentId", AuthRequired, async function (req, res) {
  const { parentId } = req.params;

  const parent = await db.getPost(parentId);

  if (!parent || parent.parentId) {
    req.flashError("That post doesn't seem to exist.");
    return res.redirect("/forum");
  }
  render(req, res, "post.html", { parent, posts: await db.getThread(parentId) });
});

router.post(
  "/post",
  AuthRequired,
  fileUpload({
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  }),
  ValidationMiddleware("post", "/forum"),
  async function (req, res) {
    const { title, message, parentId, ...convertParams } = req.body;
    if (parentId) {
      const parentPost = await db.getPost(parentId);

      if (!parentPost) {
        req.flashError("That post doesn't seem to exist.");
        return res.redirect("/forum");
      }
    }

    let attachedImage = null;

    if (req.files && req.files.image) {
      const fileName = randomBytes(16).toString("hex");
      const filePath = path.join(__dirname, "..", "uploads", fileName);

      try {
        const processedImage = await convert({
          ...convertParams,
          srcData: req.files.image.data,
          format: "AVIF",
        });

        await fs.writeFile(filePath, processedImage);

        attachedImage = `/uploads/${fileName}`;
      } catch (error) {
        req.flashError("There was an issue processing your image, please try again.");
        console.error("Error occured while processing image:", error);
        return res.redirect("/forum");
      }
    }

    const { lastID: postId } = await db.createPost(req.session.userId, parentId, title, message, attachedImage);

    if (parentId) {
      return res.redirect(`/forum/post/${parentId}#post-${postId}`);
    } else {
      return res.redirect(`/forum/post/${postId}`);
    }
  }
);

module.exports = (database) => {
  db = database;
  return router;
};
