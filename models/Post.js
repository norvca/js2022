const postsCollection = require("../db")
  .db()
  .collection("posts");
const ObjectId = require("mongodb").ObjectId;

function Post(data, userId) {
  this.data = data;
  this.errors = [];
  this.userId = userId;
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
    createdDate: new Date(),
    author: ObjectId(this.userId)
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

Post.findPostById = function(id) {
  return new Promise(async function(resolve, reject) {
    if (typeof id != "string" || !ObjectId.isValid(id)) {
      return reject("Invalid post id!");
    }

    let post = await postsCollection.findOne({ _id: new ObjectId(id) });
    if (post) {
      resolve(post);
    } else {
      reject("Can not find the post!");
    }
  });
};

module.exports = Post;
