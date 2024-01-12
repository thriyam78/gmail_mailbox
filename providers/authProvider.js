const fs = require("fs").promises;
const { google } = require("googleapis");
const express = require("express");
const config = require("../config/config");
const { tokenPath } = require("../config/tokenConfig");
const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];
async function authorization(callback) {
  const oAuth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirecturl
  );
  try {
    const token = await fs.readFile(tokenPath);
    oAuth2Client.setCredentials(JSON.parse(token));

    console.log("Token already exists:", tokenPath);
    callback(oAuth2Client);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(
        `Token file not found. Creating an empty file at ${tokenPath}`
      );
      await fs.writeFile(tokenPath, "{}");
    } else {
      console.error("Error reading token file:", error.message);
    }

    const app = express();

    app.get("/auth/google_oauth2/callback", async (req, res) => {
      const code = req.query.code;
      console.log(code);

      if (code) {
        try {
          const { tokens } = await oAuth2Client.getToken({
            code: code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.redirecturl,
          });

          oAuth2Client.setCredentials(tokens);

          await fs.writeFile(tokenPath, JSON.stringify(tokens));
          console.log("Token created and stored at", tokenPath);

          res.send("Authentication successful. You can close this page now.");
          callback(oAuth2Client);
        } catch (err) {
          console.error("Error retrieving or storing token:", err.message);
          res.status(500).send("Error occurred during authentication.");
        }
      } else {
        res.status(400).send("Code not found in the query parameters.");
      }
    });

    const server = app.listen(3000, () => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      console.log("Authorize this app by visiting this URL:", authUrl);
    });

    // Close the server after authorization
    process.on("exit", () => server.close());
  }
}

module.exports = { authorization };
