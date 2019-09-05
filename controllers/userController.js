const User = require("../models/User");

exports.home = (req, res) => {
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    res.render("home-guest");
  }
};

exports.register = (req, res) => {
  const user = new User(req.body);
  user.register();

  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("Thank you for register us!");
  }
};

exports.login = (req, res) => {
  const user = new User(req.body);
  user
    .login()
    .then(function(result) {
      req.session.user = { username: user.data.username, number: 9527 };
      res.send(result);
    })
    .catch(function(err) {
      res.send(err);
    });
};
