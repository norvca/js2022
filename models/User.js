const validator = require("validator");

function User(data) {
  this.data = data;
  this.errors = [];
}

User.prototype.validate = function() {
  const username = this.data.username;
  const email = this.data.email;
  const password = this.data.password;

  // Vertify username
  if (username === "") {
    this.errors.push("You must provide a username.");
  }
  if (username != "" && !validator.isAlphanumeric(username)) {
    this.errors.push("User can only contain letters and numbers.");
  }
  if (username.length > 0 && username.length < 4) {
    this.errors.push("username must be set at least 4 characters.");
  }
  if (username.length > 0 && username.length > 30) {
    this.errors.push("username must be set at most 30 characters.");
  }

  // Vertify email
  if (!validator.isEmail(email)) {
    this.errors.push("You must provide a valid email.");
  }

  // Vertify password
  if (password === "") {
    this.errors.push("You must provide a password.");
  }
  if (password.length > 0 && password.length < 6) {
    this.errors.push("Password must be set at least 6 characters.");
  }
  if (password.length > 0 && password.length > 30) {
    this.errors.push("Password must be set at most 30 characters.");
  }
};

User.prototype.register = function() {
  // 1. Validate user data
  this.validate();

  // 2. Save user data into database
};

module.exports = User;
