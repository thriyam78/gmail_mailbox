const { google } = require("googleapis");
const { sendEmail } = require("../utils/email");
const { labelName } = require("../config/config");

function createGmail(auth) {
  return google.gmail({ version: "v1", auth });
}

async function sendReplyAndLabel(gmailClient, threadId, newlabelId) {
  try {
    // Send a reply email
    await sendEmail({
      email: "mailtothriyam@gmail.com",
      subject: "Re: Your Subject",
      text: "Thank you for your email. I am currently out on vacation and will get back to you as soon as possible.",
    });

    // Update the label
    const label = await gmailClient.users.labels.update({
      userId: "me",
      id: newlabelId,
      resource: {
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });

    console.log(label);

    // Modify the thread by adding the label
    const modifiedThread = await gmailClient.users.threads.modify({
      userId: "me",
      id: threadId,
      requestBody: {
        addLabelIds: [label.data.id],
      },
    });

    console.log(modifiedThread);

    console.log("Replied and labeled thread:", threadId);
  } catch (error) {
    console.error("Error in sendReplyAndLabel:", error.message);
  }
}

module.exports = { sendReplyAndLabel, createGmail };
