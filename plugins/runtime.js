// === runtime.js ===

const fakevCard = require('../lib/fakevcard');
const startTime = Date.now();

function getUptime() {
  const uptime = Date.now() - startTime;
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, totalMs: uptime };
}

function getRuntimeCommand() {
  return {
    pattern: "runtime",
    tags: ["utility"],
    desc: "Show bot uptime",
    react: "🕐",
    filename: __filename,
    use: ".runtime",

    execute: async (conn, message, args, { from, reply }) => {
      try {
        const uptime = getUptime();
        const runtimeText = `🕐 *SHAHBAZ-XD-LITE ᴜᴘᴛɪᴍᴇ*
        
⏰ ᴜᴘᴛɪᴍᴇ: ${uptime.days}d ${uptime.hours}h ${uptime.minutes}m ${uptime.seconds}s
🚀 sᴛᴀʀᴛᴇᴅ: ${new Date(startTime).toLocaleString()}
📊 ᴛᴏᴛᴀʟ: ${uptime.totalMs} milliseconds`;

        // React first
        await conn.sendMessage(from, {
          react: { text: "🕐", key: message.key }
        });

        // Check if it's a newsletter context
        const isNewsletter = from.endsWith('@newsletter');
        
        if (isNewsletter) {
          // Send with newsletter context only for newsletters
          await conn.sendMessage(from, {
            text: runtimeText,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363424231270188@newsletter",
                newsletterName: "★彡[SHAHBAZ-XD-LITE-ᴍᴅ]彡★",
                serverMessageId: 147
              }
            }
          }, { quoted: fakevCard });
        } else {
          // For regular chats - use both contexts combined
          await conn.sendMessage(from, {
            text: runtimeText,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363424231270188@newsletter",
                newsletterName: "❀༒★[SHAHBAZ-XD-LITE-ᴍᴅ]★༒❀",
                serverMessageId: 147
              },
              externalAdReply: {
                title: "SHAHBAZ-XD-LITE",
                body: "SHAHBAZ-XD-LITE - ʟɪᴛᴇ ᴜᴘᴛɪᴍᴇ ɪɴғᴏ ",
                thumbnailUrl: "https://files.catbox.moe/ob2dvy.jpg",
                sourceUrl: "https://github.com/shahzebyc3/SHAHBAZ-XD-LITE",
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: fakevCard });
        }

      } catch (e) {
        console.error("Runtime error:", e);

        // React ❌
        await conn.sendMessage(from, {
          react: { text: "❌", key: message.key }
        });

        // Check context for error message too
        const isNewsletter = from.endsWith('@newsletter');
        
        if (isNewsletter) {
          await conn.sendMessage(from, {
            text: "⚠️ Failed to fetch runtime info.",
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363424231270188@newsletter",
                newsletterName: "❀༒★[SHAHBAZ-XD-LITE",
                serverMessageId: 148
              }
            }
          }, { quoted: fakevCard });
        } else {
          // For regular chats - use both contexts for error message too
          await conn.sendMessage(from, {
            text: "⚠️ Failed to fetch runtime info.",
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363424231270188@newsletter",
                newsletterName: "❀༒★[SHAHBAZ-XD-LITE-ᴍᴅ]★༒❀",
                serverMessageId: 148
              },
              externalAdReply: {
                title: "❌ Error",
                body: "Failed to fetch runtime information",
                thumbnailUrl: "https://files.catbox.moe/ob2dvy.jpg",
                sourceUrl: "https://github.com/shahzebyc3/SHAHBAZ-XD-LITE",
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: fakevCard });
        }
      }
    }
  };
}

module.exports = {
  getUptime,
  getRuntimeCommand
};
