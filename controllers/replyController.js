const { labelName } = require("../config/config");
const {
  createGmail,
  sendReplyAndLabel,
} = require("../controllers/gmailController");

async function createLabelIfNotExists(gmailClient) {
  try {
    const labelsResponse = await gmailClient.users.labels.list({
      // Check if the label exists
      userId: "me",
    });

    const labels = labelsResponse.data.labels;
    const existingLabel = labels.find((label) => label.name === labelName);

    if (!existingLabel) {
      const createdLabel = await gmailClient.users.labels.create({
        // Label doesn't exist, create it
        userId: "me",
        requestBody: {
          name: labelName,
          labelListVisibility: "labelShow",
          messageListVisibility: "show",
        },
      });

      console.log("Label created:", createdLabel.data);
      return createdLabel.data.id;
    }

    return existingLabel.id;
  } catch (error) {
    console.error("Error creating label:", error.message);
    throw error;
  }
}

async function checkAndReply(auth) {
  try {
    const gmailClient = createGmail(auth);
    const response = await gmailClient.users.threads.list({
      userId: "me",
      q: "in:inbox AND from:mailtothriyam@gmail.com", // quering/filtering the desired threads
    });

    const threads = response?.data?.threads;

    for (const thread of threads) {
      const threadId = thread?.id;

      const messagesResponse = await gmailClient.users.messages.list({
        userId: "me",
        q: `in:inbox AND label:${labelName}`, // quering/filtering the desired messages from the threadId
        id: threadId,
      });

      const messages = messagesResponse.data.messages;

      for (const message of messages) {
        const messageId = message.id;

        const fullMessage = await gmailClient.users.messages.get({
          userId: "me",
          id: messageId,
        });

        console.log(fullMessage.data.labelIds);
        const newlabelId = await createLabelIfNotExists(gmailClient); // once we check whether labelId exists or not if it doesn't exist will create one
        const hasLabel = fullMessage.data.labelIds.includes(newlabelId); // and the labelId will be passed to send the email for that particular labelled thread

        console.log(hasLabel); //provide boolean value
        if (hasLabel) {
          await sendReplyAndLabel(gmailClient, threadId, newlabelId); //calling the nodemailer included function for sending the reply mail
          console.log("Replied and labeled thread:", threadId);
        }
      }
    }
  } catch (error) {
    console.error("Error in checkAndReply:", error.message);
  }
}

module.exports = { checkAndReply };
