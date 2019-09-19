const postsCollection = require("../db")
  .db()
  .collection("posts");
const ObjectId = require("mongodb").ObjectId;
const User = require("../models/User");
const sanitizeHTML = require("sanitize-html");

function Post(data, userId, requestedPostId) {
  this.data = data;
  this.errors = [];
  this.userId = userId;
  this.requestedPostId = requestedPostId;
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
    title: sanitizeHTML(title.trim(), {
      allowedTags: [],
      allowedAttributes: {}
    }),
    body: sanitizeHTML(body.trim(), {
      allowedTags: [],
      allowedAttributes: {}
    }),
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
        .then(info => {
          resolve(info.ops[0]._id);
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

Post.prototype.update = function() {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userId);
      if (post.isVisitorOwner) {
        let status = await this.actuallyUpdate();
        resolve(status);
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Post.prototype.actuallyUpdate = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      postsCollection.findOneAndUpdate(
        { _id: new ObjectId(this.requestedPostId) },
        { $set: { title: this.data.title, body: this.data.body } }
      );
      resolve("success");
    } else {
      resolve("failure");
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
        _id: post.author._id,
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

Post.delete = function(postIdToDelete, visitorId) {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(postIdToDelete, visitorId);
      if (post.isVisitorOwner) {
        await postsCollection.deleteOne({ _id: new ObjectId(postIdToDelete) });
        resolve();
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

module.exports = Post;
