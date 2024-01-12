const cors = require("cors");
const bodyparser = require("body-parser");
const express = require("express");

const app = express();
app.use(cors());
app.use(bodyparser.json());
app.use(
  bodyparser.urlencoded({
    extended: "true",
  })
);
const { authorization } = require("./providers/authProvider");
const { checkAndReply } = require("./controllers/replyController");
authorization(checkAndReply);
module.exports = app;
