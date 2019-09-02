const User = require("../models/User");

exports.home = (req, res) => {
  res.render("home-guest");
};

exports.register = (req, res) => {
  const user = new User(req.body);
  user.register();
  console.log(user);

  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("Thank you for register us!");
  }
};