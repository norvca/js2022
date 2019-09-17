const postsCollection = require("../db")
  .db()
  .collection("posts");
const ObjectId = require("mongodb").ObjectId;
const User = require("../models/User");

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

Post.reusablePostQuery = function(uniqueOperations, visitorId) {
  return new Promise(async function(resolve, reject) {
    let aggreOperations = uniqueOperations.concat([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDocument"
        }
      },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          author: { $arrayElemAt: ["$authorDocument", 0] }
        }
      }
    ]);

    let posts = await postsCollection.aggregate(aggreOperations).toArray();
    // Clean up author property in each post object
    posts = posts.map(function(post) {
      post.isVisitorOwner = post.author._id.equals(visitorId);
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      };

      return post;
    });

    resolve(posts);
  });
};

Post.findSingleById = function(id, visitorId) {
  return new Promise(async function(resolve, reject) {
    if (typeof id != "string" || !ObjectId.isValid(id)) {
      return reject("Invalid post id!");
    }

    let posts = await Post.reusablePostQuery(
      [{ $match: { _id: new ObjectId(id) } }],
      visitorId
    );

    if (posts.length) {
      resolve(posts[0]);
    } else {
      reject("Can not find the post!");
    }
  });
};

Post.findByAuthorId = function(authorId) {
  return Post.reusablePostQuery([
    { $match: { author: authorId } },
    { $sort: { createdDate: -1 } }
  ]);
};

module.exports = Post;
