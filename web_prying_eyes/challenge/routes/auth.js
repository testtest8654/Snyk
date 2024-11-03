const express = require("express");
const { RedirectIfAuthed } = require("../middleware/AuthMiddleware");
const ValidationMiddleware = require("../middleware/ValidationMiddleware");
const { render } = require("../utils");

const router = express.Router();
let db;

router.get("/login", RedirectIfAuthed, function (req, res) {
  render(req, res, "login.html");
});

router.post("/login", RedirectIfAuthed, ValidationMiddleware("login", "/auth/login"), async function (req, res) {
  const user = await db.loginUser(req.body.username, req.body.password);
  if (!user) {
    req.flashError("Please specify a valid username and password.");
    return res.redirect("/auth/login");
  }

  req.session = {
    flashes: {
      success: [],
      error: [],
    },
    userId: user.id,
  };

  req.flashSuccess("You are now logged in.");
  return res.redirect("/forum");
});

router.get("/register", RedirectIfAuthed, function (req, res) {
  render(req, res, "register.html");
});

router.post("/register", RedirectIfAuthed, ValidationMiddleware("register", "/auth/register"), async function (req, res) {
  const user = await db.getUserByUsername(req.body.username);
  if (user) {
    req.flashError("That username already exists.");
    return res.redirect("/auth/register");
  }
  await db.registerUser(req.body.username, req.body.password);

  req.flashSuccess("You are now registered.");
  return res.redirect("/auth/login");
});

router.get("/logout", function (req, res) {
  req.session.userId = null;

  req.flashSuccess("You have been logged out.");
  return res.redirect("/forum");
});

module.exports = (database) => {
  db = database;
  return router;
};
