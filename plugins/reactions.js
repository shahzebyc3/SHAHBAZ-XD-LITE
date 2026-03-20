// === reaction-commands.js ===
const { fetchJson } = require('../lib/functions2');
const { fakevCard } = require('../lib/fakevcard');
const axios = require('axios');
const { fetchGif, gifToVideo } = require('../lib/fetchGif');

module.exports = [
  {
    pattern: "cry",
    desc: "Send a crying reaction GIF",
    category: "reaction",
    react: "😢",
    filename: __filename,
    use: ".cry @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        // Proper mention handling
        let mentions = [sender]; // Always include sender
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} is crying over @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is crying!`;
        } else {
          message = `😢 Your Cry Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/cry";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean) // Remove any undefined values
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "cuddle",
    desc: "Send a cuddle reaction GIF",
    category: "reaction",
    react: "🤗",
    filename: __filename,
    use: ".cuddle @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} cuddled @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is cuddling everyone!`;
        } else {
          message = `🤗 Your Cuddle Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/cuddle";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "bully",
    desc: "Send a bully reaction GIF",
    category: "reaction",
    react: "😈",
    filename: __filename,
    use: ".bully @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} is bullying @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is bullying everyone!`;
        } else {
          message = `😈 Your Bully Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/bully";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "hug",
    desc: "Send a hug reaction GIF",
    category: "reaction",
    react: "🤗",
    filename: __filename,
    use: ".hug @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} hugged @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is hugging everyone!`;
        } else {
          message = `🤗 Your Hug Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/hug";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "awoo",
    desc: "Send an awoo reaction GIF",
    category: "reaction",
    react: "🐺",
    filename: __filename,
    use: ".awoo @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} awoos at @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is awooing everyone!`;
        } else {
          message = `🐺 Your Awoo Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/awoo";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "lick",
    desc: "Send a lick reaction GIF",
    category: "reaction",
    react: "👅",
    filename: __filename,
    use: ".lick @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} licked @${mentionedUser.split('@')[0]}`;
        } else {
          message = `@${sender.split('@')[0]} licked themselves!`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/lick";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "pat",
    desc: "Send a pat reaction GIF",
    category: "reaction",
    react: "🫂",
    filename: __filename,
    use: ".pat @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} patted @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is patting everyone!`;
        } else {
          message = `🫂 Your Pat Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/pat";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "smug",
    desc: "Send a smug reaction GIF",
    category: "reaction",
    react: "😏",
    filename: __filename,
    use: ".smug @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} is smug at @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is feeling smug!`;
        } else {
          message = `😏 Your Smug Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/smug";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "bonk",
    desc: "Send a bonk reaction GIF",
    category: "reaction",
    react: "🔨",
    filename: __filename,
    use: ".bonk @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} bonked @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is bonking everyone!`;
        } else {
          message = `🔨 Your Bonk Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/bonk";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "yeet",
    desc: "Send a yeet reaction GIF",
    category: "reaction",
    react: "💨",
    filename: __filename,
    use: ".yeet @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} yeeted @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is yeeting everyone!`;
        } else {
          message = `💨 Your Yeet Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/yeet";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "blush",
    desc: "Send a blush reaction GIF",
    category: "reaction",
    react: "😊",
    filename: __filename,
    use: ".blush @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} is blushing at @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is blushing!`;
        } else {
          message = `😊 Your Blush Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/blush";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "handhold",
    desc: "Send a hand-holding reaction GIF",
    category: "reaction",
    react: "🤝",
    filename: __filename,
    use: ".handhold @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} is holding hands with @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} wants to hold hands with everyone!`;
        } else {
          message = `🤝 Your Handhold Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/handhold";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "highfive",
    desc: "Send a high-five reaction GIF",
    category: "reaction",
    react: "✋",
    filename: __filename,
    use: ".highfive @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} gave a high-five to @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is high-fiving everyone!`;
        } else {
          message = `✋ Your Highfive Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/highfive";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "nom",
    desc: "Send a nom reaction GIF",
    category: "reaction",
    react: "🍽️",
    filename: __filename,
    use: ".nom @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} is nomming @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is nomming everyone!`;
        } else {
          message = `🍽️ Your Nom Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/nom";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "wave",
    desc: "Send a wave reaction GIF",
    category: "reaction",
    react: "👋",
    filename: __filename,
    use: ".wave @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} waved at @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is waving at everyone!`;
        } else {
          message = `👋 Your Wave Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/wave";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "smile",
    desc: "Send a smile reaction GIF",
    category: "reaction",
    react: "😁",
    filename: __filename,
    use: ".smile @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} smiled at @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is smiling at everyone!`;
        } else {
          message = `😁 Your Smile Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/smile";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "wink",
    desc: "Send a wink reaction GIF",
    category: "reaction",
    react: "😉",
    filename: __filename,
    use: ".wink @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} winked at @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is winking at everyone!`;
        } else {
          message = `😉 Your Wink Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/wink";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "happy",
    desc: "Send a happy reaction GIF",
    category: "reaction",
    react: "😊",
    filename: __filename,
    use: ".happy @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} is happy with @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is happy with everyone!`;
        } else {
          message = `😊 Your Happy Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/happy";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "glomp",
    desc: "Send a glomp reaction GIF",
    category: "reaction",
    react: "🤗",
    filename: __filename,
    use: ".glomp @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} glomped @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is glomping everyone!`;
        } else {
          message = `🤗 Your Glomp Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/glomp";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "bite",
    desc: "Send a bite reaction GIF",
    category: "reaction",
    react: "🦷",
    filename: __filename,
    use: ".bite @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} bit @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is biting everyone!`;
        } else {
          message = `🦷 Your Bite Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/bite";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "poke",
    desc: "Send a poke reaction GIF",
    category: "reaction",
    react: "👉",
    filename: __filename,
    use: ".poke @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} poked @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} poked everyone`;
        } else {
          message = `👉 Your Poke Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/poke";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "cringe",
    desc: "Send a cringe reaction GIF",
    category: "reaction",
    react: "😬",
    filename: __filename,
    use: ".cringe @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} thinks @${mentionedUser.split('@')[0]} is cringe`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} finds everyone cringe`;
        } else {
          message = `😬 Your Cringe Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/cringe";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "dance",
    desc: "Send a dance reaction GIF",
    category: "reaction",
    react: "💃",
    filename: __filename,
    use: ".dance @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} danced with @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} is dancing with everyone`;
        } else {
          message = `💃 Your Dance Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/dance";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "kill",
    desc: "Send a kill reaction GIF",
    category: "reaction",
    react: "🔪",
    filename: __filename,
    use: ".kill @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} killed @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} killed everyone`;
        } else {
          message = `🔪 Your Kill Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/kill";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "slap",
    desc: "Send a slap reaction GIF",
    category: "reaction",
    react: "✊",
    filename: __filename,
    use: ".slap @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} slapped @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} slapped everyone`;
        } else {
          message = `✊ Your Slap Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/slap";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "kiss",
    desc: "Send a kiss reaction GIF",
    category: "reaction",
    react: "💋",
    filename: __filename,
    use: ".kiss @tag (optional)",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        let sender = mek.sender;
        let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender);
        let isGroup = m.isGroup;
        
        let mentions = [sender];
        let message = "";
        
        if (mentionedUser) {
          mentions.push(mentionedUser);
          message = `@${sender.split('@')[0]} kissed @${mentionedUser.split('@')[0]}`;
        } else if (isGroup) {
          message = `@${sender.split('@')[0]} kissed everyone`;
        } else {
          message = `💋 Your Kiss Reaction`;
        }

        const apiUrl = "https://api.waifu.pics/sfw/kiss";
        const res = await axios.get(apiUrl);
        const gifUrl = res.data.url;

        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: message,
          gifPlayback: true,
          mentions: mentions.filter(Boolean)
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  }
];