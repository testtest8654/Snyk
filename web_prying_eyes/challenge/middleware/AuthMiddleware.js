const AuthRequired = (req, res, next) => {
  if (!req.session.userId) {
    req.flashError("You must be logged in to view this.");
    return res.redirect("/auth/login");
  }
  next();
};

const RedirectIfAuthed = (req, res, next) => {
  if (req.session.userId) return res.redirect("/forum");
  next();
};

module.exports = {
  AuthRequired,
  RedirectIfAuthed,
};
