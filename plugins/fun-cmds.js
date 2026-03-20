// === fun-commands.js ===
const { fetchJson } = require('../lib/functions2');
const { fakevCard } = require('../lib/fakevcard');

module.exports = [
  {
    pattern: 'joke',
    desc: 'Fetch a random joke',
    category: 'fun',
    react: '🤣',
    filename: __filename,
    use: '.joke',
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const data = await fetchJson('https://official-joke-api.appspot.com/random_joke');
        if (!data?.setup || !data?.punchline) {
          await reply('❌ Failed to fetch joke 😔');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        const caption = `
╭───[ *Random Joke* ]───
│
├ *Setup*: ${data.setup} 🤡
├ *Punchline*: ${data.punchline} 😂
│
╰───[ *SHAHBAZ-XD-LITE* ]───
> Powered by SHAHBAZ-XD-LITE
        `.trim();

        await conn.sendMessage(from, { text: caption, contextInfo: { mentionedJid: [m.sender] } }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('joke error:', e);
        const errorMsg = e.message.includes('timeout') ? '❌ Request timed out ⏰' : '❌ Failed to fetch joke 😞';
        await reply(errorMsg);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      }
    }
  },
  {
    pattern: 'flirt',
    desc: 'Fetch a random flirt line',
    category: 'fun',
    react: '💘',
    filename: __filename,
    use: '.flirt',
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const shizokeys = 'shizo';
        const data = await fetchJson(`https://shizoapi.onrender.com/api/texts/flirt?apikey=${shizokeys}`);
        if (!data?.result) {
          throw new Error('Invalid API response');
        }

        const caption = `
╭───[ *Flirt Line* ]───
│
├ *Line*: ${data.result} 💘
│
╰───[ *SHAHBAZ-XD-LITE* ]───
> Powered by SHAHBAZ-XD-LITE
        `.trim();

        await conn.sendMessage(from, { text: caption, contextInfo: { mentionedJid: [m.sender] } }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('flirt error:', e);
        const errorMsg = e.message.includes('timeout') ? '❌ Request timed out ⏰' : '❌ Failed to fetch flirt line 😞';
        await reply(errorMsg);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      }
    }
  },
  {
    pattern: 'truth',
    desc: 'Fetch a random truth question',
    category: 'fun',
    react: '❓',
    filename: __filename,
    use: '.truth',
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const shizokeys = 'shizo';
        const data = await fetchJson(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`);
        if (!data?.result) {
          throw new Error('Invalid API response');
        }

        const caption = `
╭───[ *Truth Question* ]───
│
├ *Question*: ${data.result} ❓
│
╰───[ *SHAHBAZ-XD-LITE* ]───
> Powered by SHAHBAZ-XD-LITE
        `.trim();

        await conn.sendMessage(from, { text: caption, contextInfo: { mentionedJid: [m.sender] } }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('truth error:', e);
        const errorMsg = e.message.includes('timeout') ? '❌ Request timed out ⏰' : '❌ Failed to fetch truth question 😞';
        await reply(errorMsg);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      }
    }
  },
  {
    pattern: 'dare',
    desc: 'Fetch a random dare',
    category: 'fun',
    react: '🎯',
    filename: __filename,
    use: '.dare',
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const shizokeys = 'shizo';
        const data = await fetchJson(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`);
        if (!data?.result) {
          throw new Error('Invalid API response');
        }

        const caption = `
╭───[ *Dare Challenge* ]───
│
├ *Dare*: ${data.result} 🎯
│
╰───[ *SHAHBAZ-XD-LITE* ]───
> Powered by SHAHBAZ-XD-LITE
        `.trim();

        await conn.sendMessage(from, { text: caption, contextInfo: { mentionedJid: [m.sender] } }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('dare error:', e);
        const errorMsg = e.message.includes('timeout') ? '❌ Request timed out ⏰' : '❌ Failed to fetch dare 😞';
        await reply(errorMsg);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      }
    }
  },
  {
    pattern: 'fact',
    desc: 'Fetch a random fun fact',
    category: 'fun',
    react: '🧠',
    filename: __filename,
    use: '.fact',
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const data = await fetchJson('https://uselessfacts.jsph.pl/random.json?language=en');
        if (!data?.text) {
          await reply('❌ Failed to fetch fun fact 😔');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        const caption = `
╭───[ *Random Fact* ]───
│
├ *Fact*: ${data.text} 🧠
│
╰───[ *SHAHBAZ-XD-LITE* ]───
> Powered by SHAHBAZ-XD-LITE
        `.trim();

        await conn.sendMessage(from, { text: caption, contextInfo: { mentionedJid: [m.sender] } }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('fact error:', e);
        const errorMsg = e.message.includes('timeout') ? '❌ Request timed out ⏰' : '❌ Failed to fetch fun fact 😞';
        await reply(errorMsg);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      }
    }
  },
  {
    pattern: 'pickupline',
    desc: 'Fetch a random pickup line',
    category: 'fun',
    react: '💬',
    filename: __filename,
    use: '.pickupline',
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const data = await fetchJson('https://api.popcat.xyz/pickuplines');
        if (!data?.pickupline) {
          throw new Error('Invalid API response');
        }

        const caption = `
╭───[ *Pickup Line* ]───
│
├ *Line*: ${data.pickupline} 💬
│
╰───[ *SHAHBAZ-XD-LITE* ]───
> Powered by SHAHBAZ-XD-LITE
        `.trim();

        await conn.sendMessage(from, { text: caption, contextInfo: { mentionedJid: [m.sender] } }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('pickupline error:', e);
        const errorMsg = e.message.includes('timeout') ? '❌ Request timed out ⏰' : '❌ Failed to fetch pickup line 😞';
        await reply(errorMsg);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      }
    }
  },
  {
    pattern: 'character',
    desc: 'Check user character',
    category: 'fun',
    react: '🔥',
    filename: __filename,
    use: '.character @user',
    execute: async (conn, mek, m, { from, args, reply, isGroup }) => {
      try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        if (!isGroup) {
          await reply('❌ This command works only in groups 😔');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        const mentionedUser = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedUser) {
          await reply('❌ Please mention a user 😔');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        const userChar = [
          'Sigma', 'Generous', 'Grumpy', 'Overconfident', 'Obedient', 'Good',
          'Simp', 'Kind', 'Patient', 'Pervert', 'Cool', 'Helpful', 'Brilliant',
          'Sexy', 'Hot', 'Gorgeous', 'Cute'
        ];
        const userCharacterSelection = userChar[Math.floor(Math.random() * userChar.length)];

        const caption = `
╭───[ *User Character* ]───
│
├ *User*: @${mentionedUser.split('@')[0]} 👤
├ *Character*: ${userCharacterSelection} 🔥
│
╰───[ *SHAHBAZ-XD-LITE* ]───
> Powered by SHAHBAZ-XD-LITE
        `.trim();

        await conn.sendMessage(from, {
          text: caption,
          contextInfo: { mentionedJid: [m.sender, mentionedUser] }
        }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('character error:', e);
        await reply('❌ Error checking character 😞');
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      }
    }
  },
  {
    pattern: 'repeat',
    desc: 'Repeat a message multiple times',
    category: 'fun',
    react: '🔄',
    filename: __filename,
    use: '.repeat <count>,<message>',
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        if (!args[0]) {
          await reply('❌ Usage: .repeat <count>,<message>\nExample: .repeat 5,hello');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        const [countStr, ...messageParts] = args.join(' ').split(',');
        const count = parseInt(countStr.trim());
        const message = messageParts.join(',').trim();

        if (isNaN(count) || count <= 0 || count > 300) {
          await reply('❌ Count must be between 1 and 300 😔');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        if (!message) {
          await reply('❌ Please provide a message 😔');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        const repeatedMessage = Array(count).fill(message).join('\n');
        const caption = `
╭───[ *Repeat Message* ]───
│
├ *Count*: ${count} 🔄
├ *Message*: ${repeatedMessage}
│
╰───[ *SHAHBAZ-XD-LITE* ]───
> Powered by SHAHBAZ-XD-LITE
        `.trim();

        await conn.sendMessage(from, { text: caption, contextInfo: { mentionedJid: [m.sender] } }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('repeat error:', e);
        await reply('❌ Error repeating message 😞');
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      }
    }
  },
  
   {
  pattern: "roast",
  desc: "Roast a mentioned or replied user (fun)",
  category: "fun",
  react: "🔥",
  filename: __filename,
  use: ".roast @user / reply",

  execute: async (conn, message, m, { from, isGroup, reply, sender }) => {
    try {
      if (!isGroup) return reply("❌ This command can only be used in groups.");

      // If user mentioned someone
      let mentioned = m.mentionedJid ? m.mentionedJid[0] : null;

      // If user replied to someone
      if (!mentioned && m.quoted) {
        mentioned = m.quoted.sender;
      }

      if (!mentioned) {
        return reply("❌ Mention or reply to someone to roast.");
      }

      // === All roasts 💀 ===
      const roasts = [
        "you're like a broken pencil — pointless. ",
        "you're like WiFi with one bar — barely working. ",
        "you're like a YouTube ad — nobody wants you, but we can’t skip you. ⏭",
        "you're like expired milk — no one wants you, but you keep showing up. ",
        "you're the human version of a typo. ⌨",
        "brains aren’t everything. In your case, they’re nothing ",
        "you must have been born on a highway, because that’s where most accidents happen ",
        "you're like a cloud — when you disappear, it’s a beautiful day ",
        "if laziness was a sport, you’d have a gold medal ",
        "your secrets are safe with me — I never even listen when you tell me them ",
        "you bring everyone together… in disappointment ",
        "you're like software updates — nobody wants you, but we’re forced to deal with you 💻",
        "your face makes onions cry ",
        "the last time you had a bright idea, Edison was still alive ",
        "you're proof that even evolution takes breaks ",
        "your personality is like a dial-up connection — outdated and annoying ",
        "you’re living proof that even mistakes can make it this far ",
        "your brain has more buffering than free WiFi in a mall ",
        "you remind me of a cloud storage trial — useless after 30 days ",
        "you're like math homework — nobody wants to do you and we all get headaches from trying 📚🤕",
      ];

      const roast = roasts[Math.floor(Math.random() * roasts.length)];

      // React 🔥
      await conn.sendMessage(from, {
        react: { text: "🔥", key: message.key }
      });

      // Send roast
      await conn.sendMessage(from, {
        text: `@${mentioned.split("@")[0]}, ${roast}`,
        mentions: [mentioned],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363424231270188@newsletter",
            newsletterName: "❀༒★[SHAHBAZ-XD-LITE]★༒❀",
            serverMessageId: 200
          }
        }
      }, { quoted: fakevCard });

    } catch (e) {
      console.error("Roast error:", e);

      // React ❌
      await conn.sendMessage(from, {
        react: { text: "❌", key: message.key }
      });

      await conn.sendMessage(from, {
        text: "⚠️ Failed to roast user.",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363424231270188@newsletter",
            newsletterName: "❀༒★[SHAHBAZ-XD-LITE-ᴍᴅ]★༒❀",
            serverMessageId: 200
          }
        }
      }, { quoted: message });
    }
  }
};
  
  {
    pattern: 'send',
    desc: 'Send a message multiple times',
    category: 'fun',
    react: '📤',
    filename: __filename,
    use: '.send <count>,<message>',
    execute: async (conn, mek, m, { from, args, reply, senderNumber }) => {
      try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const botOwner = conn.user.id.split(':')[0];
        if (senderNumber !== botOwner) {
          await reply('❌ Owner-only command 🚫');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        if (!args[0]) {
          await reply('❌ Usage: .send <count>,<message>\nExample: .send 5,hello');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        const [countStr, ...messageParts] = args.join(' ').split(',');
        const count = parseInt(countStr.trim());
        const message = messageParts.join(',').trim();

        if (isNaN(count) || count <= 0 || count > 100) {
          await reply('❌ Count must be between 1 and 100 😔');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        if (!message) {
          await reply('❌ Please provide a message 😔');
          await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
          return;
        }

        await reply(`📤 Sending "${message}" ${count} times...`);
        for (let i = 0; i < count; i++) {
          await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [m.sender] } }, { quoted: fakevCard });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const caption = `
╭───[ *Send Message* ]───
│
├ *Count*: ${count} 📤
├ *Status*: Sent successfully ✅
│
╰───[ *SHAHBAZ-XD-LITE* ]───
> Powered by SHAHBAZ-XD-LITE
        `.trim();

        await conn.sendMessage(from, { text: caption, contextInfo: { mentionedJid: [m.sender] } }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('send error:', e);
        await reply('❌ Error sending messages 😞');
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      }
    }
  }
];