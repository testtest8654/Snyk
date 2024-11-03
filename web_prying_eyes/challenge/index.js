const express = require("express");
const nunjucks = require("nunjucks");

const cookieSession = require("cookie-session");
const { randomBytes } = require("node:crypto");

const Database = require("./database");
const { render } = require("./utils");
const FlashMiddleware = require("./middleware/FlashMiddleware");
const AuthRoutes = require("./routes/auth");
const ForumRoutes = require("./routes/forum");

const app = express();

const db = new Database("./database.db");

// Set up the templating engine
const env = nunjucks.configure("views", {
  autoescape: true,
  express: app,
});
env.addFilter("date", (timestamp) => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
});

app.use(
  cookieSession({
    name: "session",
    secret: randomBytes(69),
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use("/static", express.static("public"));
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      res.setHeader("Content-Type", "image/avif");
    },
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(FlashMiddleware);

app.get("/", function (req, res) {
  res.redirect("/forum");
});
app.use("/auth", AuthRoutes(db));
app.use("/forum", ForumRoutes(db));

app.use("*", (req, res) => {
  res.status(404);
  render(req, res, "error.html", { errorMessage: "We can't seem to find that page!", errorCode: "404" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500);
  render(req, res, "error.html", { errorMessage: "Something went wrong!", errorCode: "500" });
});

(async () => {
  await db.connect();
  await db.migrate();
  app.listen(1337, "0.0.0.0", () => console.log("Listening on port 1337"));
})();
