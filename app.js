const express = require("express");
const app = express();
const router = require("./router");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

let sessionOptions = session({
  secret: "javascript2022",
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 20, httpOnly: true }
});

app.use(sessionOptions);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));

app.use("/", router);

module.exports = app;
