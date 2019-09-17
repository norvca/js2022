const express = require("express");
const app = express();
const router = require("./router");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");

let sessionOptions = session({
  secret: "javascript2022",
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
});

app.use(sessionOptions);
app.use(flash());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));

app.use(function(req, res, next) {
  // Make current user id available on req object
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }

  // Make user session data available in view template
  res.locals.user = req.session.user;
  next();
});

app.use("/", router);

module.exports = app;
