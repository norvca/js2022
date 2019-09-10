const postsCollection = require("../db")
  .db()
  .collection("posts");

function Post(data) {
  this.data = data;
  this.errors = [];
}

Post.prototype.cleanUp = function() {
  const title = this.data.title;
  const body = this.data.body;

  if (typeof title != "string") {
    this.data.title = "";
  }
  if (typeof body != "string") {
    this.data.body = "";
  }

  this.data = {
    title: title,
    body: body,
    createdDate: new Date()
  };
};

Post.prototype.validate = function() {
  if (this.data.title == "") {
    this.errors.push("You must provide a title.");
  }
  if (this.data.body == "") {
    this.errors.push("You must provide a content.");
  }
};

Post.prototype.create = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();

    if (!this.errors.length) {
      // Save post into database
      postsCollection
        .insertOne(this.data)
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.errors.push("Please try again later.");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

module.exports = Post;
