// === group.js ===
const fakevCard = require('../lib/fakevcard');

// Common functions defined once
const getGroupMetadata = async (conn, from) => {
  try {
    return await conn.groupMetadata(from);
  } catch {
    throw new Error("❌ Failed to get group info.");
  }
};

const checkAdminPermission = async (conn, from, sender) => {
  const metadata = await getGroupMetadata(conn, from);
  const participant = metadata.participants.find(p => p.id === sender);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
  const isOwner = conn.user.id.split(":")[0] === sender.split("@")[0];
  
  if (!isAdmin && !isOwner) throw new Error("❌ Only admins can use this command.");
  return metadata;
};

const getTargetUser = (m) => {
  if (m.mentionedJid && m.mentionedJid.length > 0) return m.mentionedJid[0];
  if (m.quoted) return m.quoted.sender;
  return null;
};

const sendSuccessMessage = async (conn, from, text, mentions = [], messageKey) => {
  if (messageKey) await conn.sendMessage(from, { react: { text: "✅", key: messageKey } });
  
  await conn.sendMessage(from, {
    text,
    mentions,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363424231270188@newsletter",
        newsletterName: "❀༒★[SHAHBAZ-XD-LITE-ᴍᴅ]★༒❀",
        serverMessageId: 200
      }
    }
  }, { quoted: fakevCard });
};

const sendErrorMessage = async (conn, from, error, messageKey) => {
  console.error("Command error:", error);
  if (messageKey) await conn.sendMessage(from, { react: { text: "❌", key: messageKey } });
};

const checkTogglePermission = async (conn, from, isGroup, sender) => {
  const jidToBase = (jid) => String(jid).split("@")[0].split(":")[0];
  const senderBase = jidToBase(sender);
  const botBase = jidToBase(conn?.user?.id || "");

  // Owner check
  let owners = [];
  if (process.env.OWNER_NUMBER) {
    owners = process.env.OWNER_NUMBER.split(",").map(num => num.trim());
  }
  const isOwner = botBase === senderBase || owners.includes(senderBase);

  // Admin check (only for groups)
  let isAdmin = false;
  if (isGroup) {
    const metadata = await getGroupMetadata(conn, from);
    const participant = metadata.participants.find(p => jidToBase(p.id) === senderBase);
    isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
  }

  if (!isOwner) {
    if (isGroup) {
      if (!isAdmin) throw new Error("❌ Only group admins or the owner can toggle this.");
    } else {
      throw new Error("❌ Only the owner can toggle this in DMs.");
    }
  }
};

// Command definitions
module.exports = [
  // === KICK COMMAND ===
  {
    pattern: "kick",
    desc: "Remove a member from the group (Admin/Owner Only)",
    category: "group",
    react: "👢",
    use: ".kick @user",

    execute: async (conn, message, m, { from, isGroup, reply, sender }) => {
      try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        await checkAdminPermission(conn, from, sender);
        
        const mentioned = m.mentionedJid ? m.mentionedJid[0] : null;
        if (!mentioned) return reply("❌ Mention a user to kick.");

        await conn.sendMessage(from, { react: { text: "👢", key: message.key } });
        await conn.groupParticipantsUpdate(from, [mentioned], "remove");
        await sendSuccessMessage(conn, from, `👢 Removed @${mentioned.split("@")[0]}`, [mentioned]);

      } catch (e) {
        await sendErrorMessage(conn, from, e, message.key);
        reply(e.message || "⚠️ Failed to kick user.");
      }
    }
  },

  // === MUTE COMMAND ===
  {
    pattern: "mute",
    desc: "Close the group (Admins Only)",
    category: "group",
    react: "🔒",
    use: ".mute",

    execute: async (conn, message, m, { from, isGroup, reply, sender }) => {
      try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        await checkAdminPermission(conn, from, sender);

        await conn.groupSettingUpdate(from, "announcement");
        await sendSuccessMessage(conn, from, "🔒 Group is now closed. Only admins can send messages.", [], message.key);

      } catch (e) {
        await sendErrorMessage(conn, from, e, message.key);
        reply(e.message || "⚠️ Failed to mute the group.");
      }
    }
  },

  // === OPEN COMMAND ===
  {
    pattern: "open",
    desc: "Open the group (Admins Only)",
    category: "group",
    react: "🔓",
    use: ".open",

    execute: async (conn, message, m, { from, isGroup, reply, sender }) => {
      try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        await checkAdminPermission(conn, from, sender);

        await conn.groupSettingUpdate(from, "not_announcement");
        await sendSuccessMessage(conn, from, "🔓 Group is now open. All members can send messages.", [], message.key);

      } catch (e) {
        await sendErrorMessage(conn, from, e, message.key);
        reply(e.message || "⚠️ Failed to open the group.");
      }
    }
  },

  // === INVITE COMMAND ===
  {
    pattern: "invite",
    desc: "Get group invite link",
    category: "group",
    react: "🔗",
    use: ".invite",

    execute: async (conn, mek, m, { from, isGroup, reply }) => {
      try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        await conn.sendMessage(from, { react: { text: "🔗", key: mek.key } });

        let code;
        try {
          code = await conn.groupInviteCode(from);
        } catch (err) {
          return reply("❌ I must be *admin* in this group to generate an invite link.");
        }

        const metadata = await getGroupMetadata(conn, from);
        const link = `https://chat.whatsapp.com/${code}`;

        await conn.sendMessage(from, {
          text: `🔗 *Group Invite Link*\n\n📌 ${metadata.subject}\n\n${link}`,
          contextInfo: {
            externalAdReply: {
              title: "Group Invite",
              body: metadata.subject,
              thumbnailUrl: "https://files.catbox.moe/ob2dvy.jpg",
              sourceUrl: link,
              mediaType: 1,
              renderSmallerThumbnail: true
            }
          }
        }, { quoted: fakevCard });

      } catch (e) {
        await sendErrorMessage(conn, from, e);
        reply("⚠️ Failed to get invite link. Make sure I'm an *admin*.");
      }
    }
  },

  // === HIDETAG COMMAND ===
  {
    pattern: "hidetag",
    desc: "Tag all members for any message/media - everyone can use",
    category: "group",
    use: ".hidetag [message] or reply to a message",

    execute: async (conn, message, m, { q, reply, from, isGroup }) => {
      try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!q && !m.quoted) return reply("❌ Provide a message or reply to a message.");

        const metadata = await getGroupMetadata(conn, from);
        const participants = metadata.participants.map(p => p.id);

        await conn.sendMessage(from, { react: { text: "👀", key: message.key } });

        if (m.quoted) {
          return await conn.sendMessage(from, { forward: m.quoted.message, mentions: participants }, { quoted: fakevCard });
        }

        if (q) {
          return await conn.sendMessage(from, { text: q, mentions: participants }, { quoted: fakevCard });
        }

      } catch (e) {
        await sendErrorMessage(conn, from, e, message.key);
        reply(`⚠️ Failed to send hidetag.\n\n${e.message}`);
      }
    }
  },

  // === GOODBYE COMMAND ===
  {
    pattern: "goodbye",
    desc: "Toggle goodbye messages (Owner/Admin only)",
    category: "group",
    react: "🚤",
    use: ".goodbye on/off",

    execute: async (conn, message, m, { q, reply, from, isGroup, sender }) => {
      try {
        await checkTogglePermission(conn, from, isGroup, sender);

        if (!q) {
          return reply(`⚙️ Usage: \`.goodbye on\` or \`.goodbye off\`\n\n📡 Current status: *${process.env.GOODBYE_ENABLED === "true" ? "ON ✅" : "OFF ❌"}*`);
        }

        if (q.toLowerCase() === "on") {
          process.env.GOODBYE_ENABLED = "true";
          await conn.sendMessage(from, { react: { text: "🚤", key: message.key } });
          return reply("✅ Goodbye messages enabled.\n\n📡 Current status: *ON*");
        } else if (q.toLowerCase() === "off") {
          process.env.GOODBYE_ENABLED = "false";
          await conn.sendMessage(from, { react: { text: "🚤", key: message.key } });
          return reply("❌ Goodbye messages disabled.\n\n📡 Current status: *OFF*");
        } else {
          return reply(`⚙️ Usage: \`.goodbye on\` or \`.goodbye off\`\n\n📡 Current status: *${process.env.GOODBYE_ENABLED === "true" ? "ON ✅" : "OFF ❌"}*`);
        }

      } catch (e) {
        await sendErrorMessage(conn, from, e, message.key);
        reply(e.message || "⚠️ Failed to toggle goodbye messages.");
      }
    }
  },

  // === WELCOME COMMAND ===
  {
    pattern: "welcome",
    desc: "Toggle welcome messages (Owner/Admin only)",
    category: "group",
    react: "😌",
    use: ".welcome on/off",

    execute: async (conn, message, m, { q, reply, from, isGroup, sender }) => {
      try {
        await checkTogglePermission(conn, from, isGroup, sender);

        if (!q) {
          return reply(`⚙️ Usage: \`.welcome on\` or \`.welcome off\`\n\n📡 Current status: *${process.env.WELCOME_ENABLED === "true" ? "ON ✅" : "OFF ❌"}*`);
        }

        if (q.toLowerCase() === "on") {
          process.env.WELCOME_ENABLED = "true";
          await conn.sendMessage(from, { react: { text: "😉", key: message.key } });
          return reply("✅ Welcome messages enabled.\n\n📡 Current status: *ON*");
        } else if (q.toLowerCase() === "off") {
          process.env.WELCOME_ENABLED = "false";
          await conn.sendMessage(from, { react: { text: "😉", key: message.key } });
          return reply("❌ Welcome messages disabled.\n\n📡 Current status: *OFF*");
        } else {
          return reply(`⚙️ Usage: \`.welcome on\` or \`.welcome off\`\n\n📡 Current status: *${process.env.WELCOME_ENABLED === "true" ? "ON ✅" : "OFF ❌"}*`);
        }

      } catch (e) {
        await sendErrorMessage(conn, from, e, message.key);
        reply(e.message || "⚠️ Failed to toggle welcome messages.");
      }
    }
  },

  // === DEMOTE COMMAND ===
  {
    pattern: "demote",
    desc: "Demote an admin to member (Admin/Owner Only)",
    category: "group",
    react: "⬇️",
    use: ".demote @user OR reply to a user",

    execute: async (conn, message, m, { from, isGroup, reply, sender }) => {
      try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        await checkAdminPermission(conn, from, sender);

        const target = getTargetUser(m);
        if (!target) return reply("❌ Mention or reply to a user to demote.");

        await conn.groupParticipantsUpdate(from, [target], "demote");
        await sendSuccessMessage(conn, from, `⬇️ Demoted @${target.split("@")[0]} from admin`, [target], message.key);

      } catch (e) {
        await sendErrorMessage(conn, from, e, message.key);
        reply(e.message || "⚠️ Failed to demote user.");
      }
    }
  },

  // === PROMOTE COMMAND ===
  {
    pattern: "promote",
    desc: "Promote a user to admin (Admin/Owner Only)",
    category: "group",
    react: "⚡",
    use: ".promote @user OR reply to a user",

    execute: async (conn, message, m, { from, isGroup, reply, sender }) => {
      try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        await checkAdminPermission(conn, from, sender);

        const target = getTargetUser(m);
        if (!target) return reply("❌ Mention or reply to a user to promote.");

        await conn.groupParticipantsUpdate(from, [target], "promote");
        await sendSuccessMessage(conn, from, `⚡ Promoted @${target.split("@")[0]} to admin`, [target], message.key);

      } catch (e) {
        await sendErrorMessage(conn, from, e, message.key);
        reply(e.message || "⚠️ Failed to promote user.");
      }
    }
  },

  // === TAGALL COMMAND ===
  {
    pattern: "tagall",
    desc: "To Tag all Members with a formatted list",
    category: "group",
    use: '.tagall [message]',

    execute: async (conn, message, m, { q, reply, from, isGroup, sender }) => {
      try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        const metadata = await checkAdminPermission(conn, from, sender);
        const participants = metadata.participants;
        const totalMembers = participants.length;
        
        if (totalMembers === 0) return reply("❌ No members found in this group.");

        const emojis = ['📢', '🔊', '🌐', '🚀', '🎉', '🔥', '⚡', '👻', '💎', '🏆'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const customMessage = q || "Attention Everyone!";
        const groupName = metadata.subject || "Unknown Group";

        let teks = `▢ *Group*: ${groupName}\n`;
        teks += `▢ *Members*: ${totalMembers}\n`;
        teks += `▢ *Message*: ${customMessage}\n\n`;
        teks += `┌───⊷ *MENTIONS*\n`;

        participants.forEach(mem => {
          if (mem.id) teks += `│${randomEmoji} @${mem.id.split('@')[0]}\n`;
        });

        teks += "└──✪ SHAHBAZ-XD-LITE ✪──";

        await conn.sendMessage(from, {
          text: teks,
          mentions: participants.map(p => p.id),
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363424231270188@newsletter",
              newsletterName: "❀༒★[SHAHBAZ-XD-LITE-ᴍᴅ]★༒❀",
              serverMessageId: 200
            }
          }
        }, { quoted: fakevCard });

      } catch (e) {
        await sendErrorMessage(conn, from, e);
        reply(e.message || `❌ Error: ${e.message}`);
      }
    }
  },

  // === TAGADMINS COMMAND ===
  {
    pattern: "tagadmins",
    desc: "To Tag all Admins of the Group",
    category: "group",
    use: '.tagadmins [message]',

    execute: async (conn, message, m, { q, reply, from, isGroup }) => {
      try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        const metadata = await getGroupMetadata(conn, from);
        const admins = metadata.participants
          .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
          .map(p => p.id);
        
        const totalAdmins = admins.length;
        if (totalAdmins === 0) return reply("❌ No admins found in this group.");

        const emojis = ['👑', '⚡', '🌟', '✨', '🎖️', '💎', '🔱', '🛡️', '🚀', '🏆'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const customMessage = q || "Attention Admins!";
        const groupName = metadata.subject || "Unknown Group";

        let teks = `▢ *Group*: ${groupName}\n`;
        teks += `▢ *Admins*: ${totalAdmins}\n`;
        teks += `▢ *Message*: ${customMessage}\n\n`;
        teks += `┌───⊷ *ADMIN MENTIONS*\n`;

        admins.forEach(adminId => {
          teks += `│${randomEmoji} @${adminId.split('@')[0]}\n`;
        });

        teks += "└──✪ SHAHBAZ-XD-LITE ✪──";

        await conn.sendMessage(from, {
          text: teks,
          mentions: admins,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363424231270188@newsletter",
              newsletterName: "❀༒★[SHAHBAZ-XD-LITE-ᴍᴅ]★༒❀",
              serverMessageId: 201
            }
          }
        }, { quoted: fakevCard });

      } catch (e) {
        await sendErrorMessage(conn, from, e);
        reply(e.message || `❌ Error: ${e.message}`);
      }
    }
  }
];