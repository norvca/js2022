const express = require("express");
const app = express();
const router = require("./router");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));

app.use("/", router);

app.listen(3000);
