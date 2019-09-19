const Post = require("../models/Post");

exports.viewCreateScreen = function(req, res) {
  res.render("create-post");
};

exports.create = function(req, res) {
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(function(newId) {
      req.flash("success", "New post successfully created!");
      req.session.save(() => res.redirect(`/post/${newId}`));
    })
    .catch(function(errors) {
      req.flash("errors", errors);
      req.session.save(() => res.redirect("/create-post"));
    });
};

exports.viewSingle = async function(req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);

    res.render("single-post-screen", { post: post });
  } catch {
    res.render("404");
  }
};

exports.viewEditScreen = async function(req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);

    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post });
    } else {
      req.flash("errors", "You do not have permisson to perform that action.");
      req.session.save(() => res.redirect("/"));
    }
  } catch {
    res.render("404");
  }
};

exports.edit = function(req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .update()
    .then(status => {
      if (status == "success") {
        // Post was successfully updated
        req.flash("success", "Post successfully updated.");
        req.session.save(function() {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      } else {
        // User did have permission, but there were validation errors
        post.errors.forEach(function(error) {
          req.flash("errors", error);
        });

        req.session.save(() => res.redirect(`/post/${req.params.id}/edit`));
      }
    })
    .catch(() => {
      // A post with requested id doesn't exist
      // Or current visitor is not the owner of requested post
      req.flash("errors", "You do not have permisson to perform that action.");
      req.session.save(() => res.redirect("/"));
    });
};

exports.delete = function(req, res) {
  Post.delete(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "Post successfully deleted!");
      req.session.save(() =>
        res.redirect(`/profile/${req.session.user.username}`)
      );
    })
    .catch(() => {
      req.flash("errors", "You do not have permission to do that action.");
      req.session.save(() => res.redirect("/"));
    });
};
