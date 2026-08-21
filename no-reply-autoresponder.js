import { EmailMessage } from "cloudflare:email";

export default {
  async email(message, env, ctx) {
    const sender = message.from;
    const recipient = message.to;
    const subject = message.headers.get("subject") || "No Subject";

    // 1. Prevent infinite auto-reply loops for automated system addresses
    if (
      sender.includes("no-reply") ||
      sender.includes("noreply") ||
      sender.includes("mailer-daemon") ||
      sender.includes("postmaster")
    ) {
      console.log(`Skipping auto-reply to system address: ${sender}`);
      return;
    }

    // 2. Construct raw RFC 2822 MIME message natively
    const rawMime = [
      `From: ${recipient}`,
      `To: ${sender}`,
      `Subject: Auto-Response: Re: ${subject}`,
      `Content-Type: text/plain; charset=UTF-8`,
      ``,
      `Hello,`,
      ``,
      `You emailed ${recipient}. This mailbox is unmonitored and cannot receive incoming replies.`,
      ``,
      `If you are replying to a message on Grandview Exchange, please refer to that message for contact information.`,
      ``,
      `Thank you!`
    ].join("\r\n");

    // 3. Dispatch the response
    const replyMessage = new EmailMessage(recipient, sender, rawMime);
    await message.reply(replyMessage);
  },
};
