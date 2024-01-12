const { google } = require("googleapis");
const { sendEmail } = require("../utils/email");
const { labelName } = require("../config/config");

function createGmail(auth) {
  return google.gmail({ version: "v1", auth });
}
async function sendReplyAndLabel(gmailClient, threadId) {
  await sendEmail({
    email: "mailtothriyam@gmail.com",
    subject: "Re: Your Subject",
    text: "Thank you for your email. I am currently out on vacation and will get back to you as soon as possible.",
  });

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

module.exports = { sendReplyAndLabel, createGmail };
