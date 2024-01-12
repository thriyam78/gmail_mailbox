const { labelName } = require("../config/config");
console.log(labelName);
const {
  createGmail,
  sendReplyAndLabel,
} = require("../controllers/gmailController");

async function checkAndReply(auth) {
  const gmailClient = createGmail(auth);
  const response = await gmailClient.users.threads.list({
    userId: "me",
    q: "in:inbox",
  });

  const threads = response?.data?.threads;

  for (const thread of threads) {
    const threadId = thread?.id;

    const messagesResponse = await gmailClient.users.messages.list({
      userId: "me",
      q: `in:inbox AND from:mailtothriyam@gmail.com`,
      id: threadId,
    });

    const messages = messagesResponse.data.messages;

    for (const message of messages) {
      const messageId = message.id;

      const fullMessage = await gmailClient.users.messages.get({
        userId: "me",
        id: messageId,
      });

      console.log(fullMessage);

      const hasLabel = fullMessage.data.labelIds.includes(
        "VacationReplyLabel/VacationReplyLabel"
      );
      console.log(hasLabel);
      //   if (hasLabel) {
      //     await sendReplyAndLabel(gmailClient, threadId);
      //     console.log("Replied and labeled thread:", threadId);
      //   }
    }
  }
}

module.exports = { checkAndReply };
