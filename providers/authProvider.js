const fs = require("fs").promises;
const { google } = require("googleapis");
const express = require("express");
const config = require("../config/config");
const { tokenPath } = require("../config/tokenConfig");
const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];
async function authorization(callback) {
  const oAuth2Client = new google.auth.OAuth2( // this will create a new oAuth2 for authorizing the gmail once it's done it goes to try catch block
    config.clientId,
    config.clientSecret,
    config.redirecturl
  );
  try {
    const token = await fs.readFile(tokenPath); // Once there is a token.json creation we will read the file and set the oAuth credentials
    oAuth2Client.setCredentials(JSON.parse(token));

    console.log("Token already exists:", tokenPath);
    callback(oAuth2Client); // this will send the oAuth2Client
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(
        `Token file not found. Creating an empty file at ${tokenPath}` //if there is no token.json we will create with empty json
      );
      await fs.writeFile(tokenPath, "{}");
    } else {
      console.error("Error reading token file:", error.message);
    }

    const app = express();

    app.get("/auth/google_oauth2/callback", async (req, res) => {
      // for fetching the code from the redirected_uri.
      const code = req.query.code;
      console.log(code);

      if (code) {
        try {
          const { tokens } = await oAuth2Client.getToken({
            //once we fetch the code it will  get the token from oAuth2Client
            code: code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.redirecturl,
          });

          oAuth2Client.setCredentials(tokens);

          await fs.writeFile(tokenPath, JSON.stringify(tokens)); //writing the token into tken.json for further app run
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
        access_type: "offline", //this will generate the AuthUrl for authorization the user from gmail.
        scope: SCOPES,
      });

      console.log("Authorize this app by visiting this URL:", authUrl);
    });

    // Close the server after authorization
    process.on("exit", () => server.close()); //This server will get closed once the authorization done
  }
}

module.exports = { authorization };
