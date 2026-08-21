import { EmailMessage } from "cloudflare:email";

export default {
  async email(message, env, ctx) {
    try {
      const sender = message.from;
      const recipient = message.to;
      const subject = message.headers.get("subject") || "No Subject";

      // 1. Skip missing sender or system loop addresses
      if (!sender) return;

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

      // 2. Generate required Message-ID and RFC-compliant domain details
      const domain = recipient.split("@")[1] || "grandviewexchange.com";
      const messageId = `<auto-reply-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@${domain}>`;

      // 3. Construct raw MIME message with required Message-ID header
      const rawMime = [
        `From: ${recipient}`,
        `To: ${sender}`,
        `Subject: Auto-Response: Re: ${subject}`,
        `Message-ID: ${messageId}`,
        `Auto-Submitted: auto-replied`,
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

      // 4. Send response
      const replyMessage = new EmailMessage(recipient, sender, rawMime);
      await message.reply(replyMessage);
      console.log(`Successfully sent auto-reply to ${sender}`);
    } catch (err) {
      console.error(`Error processing incoming email: ${err.message}`, err);
    }
  },
};
