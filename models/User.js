const userCollection = require("../db").collection("users");
const validator = require("validator");

function User(data) {
  this.data = data;
  this.errors = [];
}

User.prototype.cleanUp = function() {
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }
  if (typeof this.data.email != "string") {
    this.data.email = "";
  }
  if (typeof this.data.password != "string") {
    this.data.password = "";
  }

  // Get rid of bogus properties
  this.data = {
    username: this.data.username.trim(),
    email: this.data.email.trim(),
    password: this.data.password
  };
};

User.prototype.validate = function() {
  const username = this.data.username.trim();
  const email = this.data.email.trim();
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
  if (password.length > 0 && password.length > 50) {
    this.errors.push("Password must be set at most 50 characters.");
  }
};

User.prototype.register = function() {
  // 1. Validate user data
  this.cleanUp();
  this.validate();

  // 2. Save user data into database
  if (!this.errors.length) {
    userCollection.insertOne(this.data);
  }
};

User.prototype.login = function(callback) {
  this.cleanUp();
  userCollection.findOne(
    { username: this.data.username },
    (err, attemptedUser) => {
      if (attemptedUser && attemptedUser.password == this.data.password) {
        callback("Login success!");
      } else {
        callback("Require valid username/password!");
      }
    }
  );
};

module.exports = User;
