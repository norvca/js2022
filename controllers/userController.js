const User = require("../models/User");

exports.home = (req, res) => {
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    res.render("home-guest", {
      errors: req.flash("errors"),
      regErrors: req.flash("regErrors")
    });
  }
};

exports.register = function(req, res) {
  const user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = { username: user.data.username };
      req.session.save(function() {
        res.redirect("/");
      });
    })
    .catch(regErrors => {
      req.flash("regErrors", regErrors);
      req.session.save(function() {
        res.redirect("/");
      });
    });
};

exports.login = (req, res) => {
  const user = new User(req.body);
  user
    .login()
    .then(function(result) {
      req.session.user = { username: user.data.username, number: 9527 };
      req.session.save(function() {
        res.redirect("/");
      });
    })
    .catch(function(err) {
      req.flash("errors", err);
      req.session.save(function() {
        res.redirect("/");
      });
    });
};

exports.logout = (req, res) => {
  req.session.destroy(function() {
    res.redirect("/");
  });
};
