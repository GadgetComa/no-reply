import { EmailMessage } from "cloudflare:email";
import createMimeMessage from "mimetext";

export default {
  async email(message, env, ctx) {
    // 1. Extract details from the incoming message
    const sender = message.from;
    const recipient = message.to;
    const subject = message.headers.get("subject") || "No Subject";

    // 2. Prevent auto-reply loops for automated system messages
    if (
      sender.includes("no-reply") ||
      sender.includes("noreply") ||
      sender.includes("mailer-daemon") ||
      sender.includes("postmaster")
    ) {
      console.log(`Skipping reply to system address: ${sender}`);
      return;
    }

    // 3. Construct the MIME response message
    const msg = createMimeMessage();
    msg.setSender({ name: "Automated System", addr: recipient });
    msg.setRecipient(sender);
    msg.setSubject(`Auto-Response: Re: ${subject}`);
    msg.setMessage(
      "text/plain",
      `Hello,\n\nYou emailed ${recipient}. This mailbox is unmonitored and cannot receive incoming replies.\n\nIf you are replying to a Grandview Exchange message, check that message for contact information and instructions.\n\nThank you!`
    );

    // 4. Send the reply using Cloudflare's reply API
    const replyMessage = new EmailMessage(
      recipient,
      sender,
      msg.asRaw()
    );

    await message.reply(replyMessage);
  },
};
