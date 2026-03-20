module.exports = {
  pattern: "mode",
  category: "utility",
  execute: async (conn, message, m, { args, reply }) => {
    try {
      const sender = message.key.participant || message.key.remoteJid;

      // 🧠 SESSION OWNER = jisne bot pair kiya
      const sessionOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";

      if (sender !== sessionOwner) {
        return reply("❌ Sirf jis user ne bot lagaya hai wahi mode change kar sakta hai");
      }

      if (!args[0]) {
        return reply(
`⚙️ *Bot Mode Settings*

🟢 .mode public  → sab use kar sakte hain  
🔒 .mode private → sirf aap

📌 Current mode: *${global.BOT_MODE}*`
        );
      }

      const mode = args[0].toLowerCase();

      if (!["public", ""].includes(mode)) {
        return reply("❌ Use: .mode public | private");
      }

      global.BOT_MODE = mode;

      return reply(
`✅ Bot mode updated successfully

🔁 New mode: *${mode.toUpperCase()}*`
      );

    } catch (e) {
      console.error("mode.js error:", e);
      reply("❌ Mode change error");
    }
  }
};
