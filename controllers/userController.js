const User = require("../models/User");
const Post = require("../models/Post");

exports.home = (req, res) => {
  if (req.session.user) {
    res.render("home-dashboard");
  } else {
    res.render("home-guest", {
      regErrors: req.flash("regErrors")
    });
  }
};

exports.register = function(req, res) {
  const user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id
      };
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
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id
      };
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

exports.mustBeLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in to perform that action");
    req.session.save(function() {
      res.redirect("/");
    });
  }
};

exports.ifUserExists = (req, res, next) => {
  User.findByUsername(req.params.username)
    .then(userDoc => {
      req.profileUser = userDoc;
      next();
    })
    .catch(() => {
      res.render("404");
    });
};

exports.profilePostsScreen = (req, res) => {
  // Ask post model for post by user id
  Post.findByAuthorId(req.profileUser._id)
    .then(posts => {
      res.render("profile", {
        posts: posts,
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar
      });
    })
    .catch(() => {
      res.render("404");
    });
};
