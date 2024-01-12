const tokenConfig = require("./tokenConfig");

module.exports = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirecturl: process.env.REDIRECT_URL,
  labelName: "VacationReplyLabel",
  tokenConfig,
};
