import { EmailMessage } from "cloudflare:email";

export default {
  async email(message, env, ctx) {
    try {
      const sender = message.from;
      const recipient = message.to;
      const subject = message.headers.get("subject") || "No Subject";

      // 1. Guard against missing sender or loop conditions
      if (!sender) {
        console.log("No sender address found. Skipping.");
        return;
      }

      const lowerSender = sender.toLowerCase();
      if (
        lowerSender.includes("no-reply") ||
        lowerSender.includes("noreply") ||
        lowerSender.includes("mailer-daemon") ||
        lowerSender.includes("postmaster")
      ) {
        console.log(`Skipping auto-reply to system address: ${sender}`);
        return;
      }

      // 2. Format RFC 2822 MIME message (Strict CRLF formatting)
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
        `If you need assistance, please contact us through our website.`,
        ``,
        `Thank you!`
      ].join("\r\n");

      // 3. Dispatch the auto-reply
      const replyMessage = new EmailMessage(recipient, sender, rawMime);
      await message.reply(replyMessage);
    } catch (err) {
      console.error(`Error processing incoming email: ${err.message}`, err);
    }
  },
};
