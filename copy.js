const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const { googleAuth, gmail } = require("google-auth-library");

// Load client secrets from a file you downloaded from the Google Cloud Console.
const credentialsPath = require("./utils/Credentials.json");
const tokenPath = require("./config/token.json");
const parsed_token = JSON.parse(tokenPath);
console.log(parsed_token);

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];

const labelName = "VacationReplyLabel";

// Create an OAuth2 client with the given credentials
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(parsed_token, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(token);
    callback(oAuth2Client);
  });
}

// Get and store new token after prompting for user authorization
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", tokenPath);
      });
      callback(oAuth2Client);
    });
  });
}

// Create a Gmail API client
function createGmailClient(auth) {
  return google.gmail({ version: "v1", auth });
}

// Send reply email and label the thread
async function sendReplyAndLabel(gmailClient, threadId) {
  // Send reply
  const mailOptions = {
    to: "recipient@example.com",
    subject: "Re: Your Subject",
    text: "Thank you for your email. I am currently out on vacation and will get back to you as soon as possible.",
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-email-password",
    },
  });

  await transporter.sendMail(mailOptions);

  // Label the thread
  const label = await gmailClient.users.labels.create({
    userId: "me",
    requestBody: {
      name: labelName,
    },
  });

  await gmailClient.users.threads.modify({
    userId: "me",
    id: threadId,
    requestBody: {
      addLabelIds: [label.data.id],
    },
  });
}

// Main function to check and reply to emails
async function checkAndReply(auth) {
  const gmailClient = createGmailClient(auth);

  const response = await gmailClient.users.threads.list({
    userId: "me",
    q: "in:inbox",
  });

  const threads = response.data.threads;

  for (const thread of threads) {
    const threadId = thread.id;
    const messagesResponse = await gmailClient.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      q: `thread:${threadId}`,
    });

    const messages = messagesResponse.data.messages;

    // Check if the thread has no prior messages from your email
    const isReplyNeeded = messages.every((message) =>
      message.labelIds.includes(labelName)
    );

    if (isReplyNeeded) {
      await sendReplyAndLabel(gmailClient, threadId);
      console.log("Replied and labeled thread:", threadId);
    }
  }
}

// Run the app in random intervals
function runApplicatioin() {
  authorize(JSON.parse(fs.readFileSync(credentialsPath)), (auth) => {
    setInterval(() => {
      checkAndReply(auth);
    }, Math.floor(Math.random() * (120000 - 45000 + 1) + 45000)); // Random interval between 45 to 120 seconds
  });
}

runApplicatioin();
