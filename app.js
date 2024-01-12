const cors = require("cors");
const bodyparser = require("body-parser");
const express = require("express");

const app = express();
app.use(cors());
app.use(bodyparser.json()); //parsing json result
app.use(
  bodyparser.urlencoded({
    extended: "true",
  })
);

const { authorization } = require("./providers/authProvider");
const { checkAndReply } = require("./controllers/replyController");

const performTasks = () => {
  authorization(checkAndReply); //Running the App and this checkAndReply works as a callback function will get the OAuthClient after authorization
  //from the authorization function and will use for further gmail API's
};

performTasks();

setInterval(() => {
  const randomDelay = Math.floor(Math.random() * (120000 - 45000 + 1) + 45000); //Perform the task running in a random intervals of 45 to 120 seconds

  console.log(`Next execution in ${randomDelay / 1000} seconds`);

  setTimeout(performTasks, randomDelay);
}, 3600000); // the whole app will run again after 1 hour
