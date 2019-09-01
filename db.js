const mongodb = require("mongodb");

const connectionString =
  "mongodb+srv://testman:test2345@project-ugt6y.mongodb.net/js2022?retryWrites=true&w=majority";

mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err, client) {
    module.exports = client.db();
    const app = require("./app");
    app.listen(3000);
  }
);
