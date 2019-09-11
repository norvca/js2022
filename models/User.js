const bcrypt = require("bcryptjs");
const userCollection = require("../db")
  .db()
  .collection("users");
const validator = require("validator");
const md5 = require("md5");

function User(data, getAvatar) {
  this.data = data;
  this.errors = [];
  if (getAvatar == undefined) {
    getAvatar = false;
  }
  if (getAvatar) {
    this.getAvatar();
  }
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
  return new Promise(async (resolve, reject) => {
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

    // Check if username has been taken
    if (
      username.length >= 4 &&
      username.length <= 30 &&
      validator.isAlphanumeric(username)
    ) {
      let usernameExist = await userCollection.findOne({ username: username });
      if (usernameExist) {
        this.errors.push("Username is already taken.");
      }
    }

    // Check if email has been taken
    if (validator.isEmail(email)) {
      let emailExist = await userCollection.findOne({ email: email });
      if (emailExist) {
        this.errors.push("email is already taken.");
      }
    }
    resolve();
  });
};

User.prototype.register = function() {
  return new Promise(async (resolve, reject) => {
    // 1. Validate user data
    this.cleanUp();
    await this.validate();

    // 2. Save user data into database
    if (!this.errors.length) {
      bcrypt
        .hash(this.data.password, 10)
        .then(async hashedPassword => {
          this.data.password = hashedPassword;
          await userCollection.insertOne(this.data);
        })
        .catch(err => {
          console.log(err);
        });
      this.getAvatar();
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.prototype.login = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp();

    userCollection
      .findOne({ username: this.data.username })
      .then(attemptedUser => {
        if (attemptedUser) {
          bcrypt
            .compare(this.data.password, attemptedUser.password)
            .then(doMatch => {
              if (doMatch) {
                this.data = attemptedUser;
                this.getAvatar();
                resolve("Login success!");
              } else {
                reject("Require valid username/password!");
              }
            });
        } else {
          reject("Require valid username/password!");
        }
      })
      .catch(function(err) {
        reject("Please try again later.");
      });
  });
};

User.prototype.getAvatar = function() {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
};

module.exports = User;
