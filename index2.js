const express = require("express");
const http = require("http");
require("dotenv").config();
const socketIo = require("socket.io");
const path = require("path");
const fs = require("fs");
const { useMultiFileAuthState, makeWASocket, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require("@whiskeysockets/baileys");
const P = require("pino");
const fakevCard = require('./lib/fakevcard');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

const GroupEvents = require("./data/groupevents");
const runtimeTracker = require('./plugins/runtime');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Store active connections
const activeConnections = new Map();
const pairingCodes = new Map();
const userPrefixes = new Map();

// Store status media for forwarding
const statusMediaStore = new Map();

let activeSockets = 0;
let totalUsers = 0;

// Creator numbers
const CREATOR_NUMBERS = ['923191285720', '923191285720'];

// Persistent data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Load persistent data
function loadPersistentData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      totalUsers = data.totalUsers || 0;
      console.log(`📊 Loaded persistent data: ${totalUsers} total users`);
    } else {
      console.log("📊 No existing persistent data found, starting fresh");
      savePersistentData(); // Create initial file
    }
  } catch (error) {
    console.error("❌ Error loading persistent data:", error);
    totalUsers = 0;
  }
}

// Save persistent data
function savePersistentData() {
  try {
    const data = {
      totalUsers: totalUsers,
      lastUpdated: new Date().toISOString(),
      sessions: Array.from(activeConnections.keys())
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Saved persistent data: ${totalUsers} total users`);
  } catch (error) {
    console.error("❌ Error saving persistent data:", error);
  }
}

// Initialize persistent data
loadPersistentData();

// Auto-save persistent data every 30 seconds
setInterval(() => {
  savePersistentData();
}, 30000);

// Sessions Backup System
const SESSION_BACKUP_DIR = path.join(__dirname, 'sessions_backup');

function backupSessions() {
  try {
    if (!fs.existsSync(SESSION_BACKUP_DIR)) {
      fs.mkdirSync(SESSION_BACKUP_DIR, { recursive: true });
    }
    
    const sessionsDir = path.join(__dirname, 'sessions');
    if (fs.existsSync(sessionsDir)) {
      // Copy all session folders to backup
      const sessions = fs.readdirSync(sessionsDir);
      sessions.forEach(session => {
        const sessionPath = path.join(sessionsDir, session);
        const backupPath = path.join(SESSION_BACKUP_DIR, session);
        
        if (fs.statSync(sessionPath).isDirectory()) {
          // Create backup of creds.json if exists
          const credsPath = path.join(sessionPath, 'creds.json');
          if (fs.existsSync(credsPath)) {
            const backupCredsPath = path.join(backupPath, 'creds.json');
            if (!fs.existsSync(backupPath)) {
              fs.mkdirSync(backupPath, { recursive: true });
            }
            fs.copyFileSync(credsPath, backupCredsPath);
          }
        }
      });
      console.log(`✅ Sessions backed up: ${sessions.length} sessions`);
    }
  } catch (error) {
    console.error('❌ Session backup error:', error);
  }
}

function restoreSessions() {
  try {
    if (!fs.existsSync(SESSION_BACKUP_DIR)) {
      console.log('📁 No backup directory found');
      return;
    }
    
    const sessionsDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
    
    const backups = fs.readdirSync(SESSION_BACKUP_DIR);
    backups.forEach(backup => {
      const backupPath = path.join(SESSION_BACKUP_DIR, backup);
      const sessionPath = path.join(sessionsDir, backup);
      
      if (fs.statSync(backupPath).isDirectory()) {
        const backupCredsPath = path.join(backupPath, 'creds.json');
        if (fs.existsSync(backupCredsPath)) {
          if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
          }
          const sessionCredsPath = path.join(sessionPath, 'creds.json');
          fs.copyFileSync(backupCredsPath, sessionCredsPath);
          console.log(`✅ Restored session: ${backup}`);
        }
      }
    });
    console.log(`🔄 Restored ${backups.length} sessions from backup`);
  } catch (error) {
    console.error('❌ Session restore error:', error);
  }
}

// Auto backup sessions every 10 minutes
setInterval(() => {
  backupSessions();
}, 10 * 60 * 1000);

// Stats broadcasting helper
function broadcastStats() {
  io.emit("statsUpdate", { activeSockets, totalUsers });
}

// Track frontend connections (stats dashboard)
io.on("connection", (socket) => {
  console.log("📊 Frontend connected for stats");
  socket.emit("statsUpdate", { activeSockets, totalUsers });

  socket.on("disconnect", () => {
    console.log("📊 Frontend disconnected from stats");
  });
});

// Channel configuration
const CHANNEL_JIDS = process.env.CHANNEL_JIDS ? process.env.CHANNEL_JIDS.split(',') : [
  "120363424231270188@newsletter"
];

// Default prefix for bot commands
let PREFIX = process.env.PREFIX || ".";

// Bot configuration from environment variables
const BOT_NAME = process.env.BOT_NAME || "SHAHBAZ-XD-LITE";
const OWNER_NAME = process.env.OWNER_NAME || "SHAHBAZ-XD-LITE";
const MENU_IMAGE_URL = process.env.MENU_IMAGE_URL || "https://files.catbox.moe/ob2dvy.jpg";
const REPO_LINK = process.env.REPO_LINK || "https://github.com/shahzebyc3/SHAHBAZ-MD";

// Auto-status configuration
const AUTO_STATUS_SEEN = process.env.AUTO_STATUS_SEEN || "true";
const AUTO_STATUS_REACT = process.env.AUTO_STATUS_REACT || "true";
const AUTO_STATUS_REPLY = process.env.AUTO_STATUS_REPLY || "true";
const AUTO_STATUS_MSG = process.env.AUTO_STATUS_MSG || "sᴛᴀᴛᴜs sᴇᴇɴ ʙʏ SHAHBAZ-XD-LITE";
const DEV = process.env.DEV || 'SHAHBAZ-XD-LITE';

// Newsletter react configuration
const NEWSLETTER_REACT = process.env.NEWSLETTER_REACT || "true";
const NEWSLETTER_REACT_EMOJIS = process.env.NEWSLETTER_REACT_EMOJIS || "💦,🧚‍♂️,🧚‍♀️,🫂";

// Track login state globally
let isUserLoggedIn = false;

// Load commands from commands folder
const commands = new Map();
const commandsPath = path.join(__dirname, 'plugins');

// Modified loadCommands function
function loadCommands() {
  commands.clear();

  if (!fs.existsSync(commandsPath)) {
    console.log("❌ Commands directory not found:", commandsPath);
    fs.mkdirSync(commandsPath, { recursive: true });
    console.log("✅ Created commands directory");
    return;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('.'));
  console.log(`📂 Loading commands from ${commandFiles.length} files...`);
  
  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);
      // Clear cache to ensure fresh load
      if (require.cache[require.resolve(filePath)]) {
        delete require.cache[require.resolve(filePath)];
      }
      const commandModule = require(filePath);
      
      if (commandModule.pattern && commandModule.execute) {
        commands.set(commandModule.pattern, commandModule);
        console.log(`✅ Loaded command: ${commandModule.pattern}`);
      }
    } catch (error) {
      console.error(`❌ Error loading commands from ${file}:`, error.message);
    }
  }
  
  // Add runtime command
  const runtimeCommand = runtimeTracker.getRuntimeCommand();
  if (runtimeCommand.pattern && runtimeCommand.execute) {
    commands.set(runtimeCommand.pattern, runtimeCommand);
  }
}

// Initial command load
loadCommands();

// Watch for changes in commands directory
if (fs.existsSync(commandsPath)) {
  fs.watch(commandsPath, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
      console.log(`🔄 Reloading command: ${filename}`);
      loadCommands();
    }
  });
}

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API endpoint to request pairing code
app.post("/api/pair", async (req, res) => {
  let conn;
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const normalizedNumber = number.replace(/\D/g, "");
    
    // Create a session directory for this user
    const sessionDir = path.join(__dirname, "sessions", normalizedNumber);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
      console.log(`📁 Created session directory: ${sessionDir}`);
    }

    // Initialize WhatsApp connection
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    
    conn = makeWASocket({
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
      auth: state,
      version,
      browser: Browsers.macOS("Safari"),
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      maxIdleTimeMs: 60000,
      maxRetries: 10,
      markOnlineOnConnect: true,
      emitOwnEvents: true,
      defaultQueryTimeoutMs: 60000,
      syncFullHistory: false,
      transactionOpts: {
        maxCommitRetries: 10,
        delayBetweenTriesMs: 3000
      }
    });

    // Check if this is a new user
    const isNewUser = !activeConnections.has(normalizedNumber) && !fs.existsSync(path.join(sessionDir, 'creds.json'));

    // Store the connection
    activeConnections.set(normalizedNumber, {
      conn,
      saveCreds,
      hasLinked: activeConnections.get(normalizedNumber)?.hasLinked || false
    });

    // Count this user in totalUsers only if it's a new user
    if (isNewUser) {
      totalUsers++;
      activeConnections.get(normalizedNumber).hasLinked = true;
      console.log(`👤 New user connected! Total users: ${totalUsers}`);
      savePersistentData();
    }

    broadcastStats();

    // Set up connection event handlers
    setupConnectionHandlers(conn, normalizedNumber, io, saveCreds);

    // Wait for connection to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Request pairing code
    const pairingCode = await conn.requestPairingCode(normalizedNumber);

    // Store the pairing code
    pairingCodes.set(normalizedNumber, {
      code: pairingCode,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      pairingCode,
      message: "Pairing code generated successfully",
      isNewUser: isNewUser
    });

  } catch (error) {
    console.error("Error generating pairing code:", error);
    if (conn) {
      try {
        conn.ws.close();
      } catch (e) {}
    }
    res.status(500).json({
      error: "Failed to generate pairing code",
      details: error.message
    });
  }
});

// Logout endpoint
app.post("/api/logout", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const normalizedNumber = number.replace(/\D/g, "");
    const sessionDir = path.join(__dirname, "sessions", normalizedNumber);

    // Check if session exists
    if (!fs.existsSync(sessionDir)) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Close the connection if active
    if (activeConnections.has(normalizedNumber)) {
      const { conn } = activeConnections.get(normalizedNumber);
      try {
        conn.ws.close();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
      activeConnections.delete(normalizedNumber);
    }

    // Delete the session folder
    fs.rmSync(sessionDir, { recursive: true, force: true });
    console.log(`🗑️ Session folder deleted for ${normalizedNumber}`);

    // Update stats
    activeSockets = Math.max(0, activeSockets - 1);
    broadcastStats();

    res.json({
      success: true,
      message: "Logged out successfully and session deleted"
    });

  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      error: "Failed to logout",
      details: error.message
    });
  }
});

// Enhanced channel subscription function
async function subscribeToChannels(conn) {
  const results = [];

  for (const channelJid of CHANNEL_JIDS) {
    try {
      console.log(`📢 Attempting to subscribe to channel: ${channelJid}`);
      let result;
      let methodUsed = 'unknown';

      // Try different approaches
      if (conn.newsletterFollow) {
        methodUsed = 'newsletterFollow';
        result = await conn.newsletterFollow(channelJid);
      } else if (conn.followNewsletter) {
        methodUsed = 'followNewsletter';
        result = await conn.followNewsletter(channelJid);
      } else if (conn.subscribeToNewsletter) {
        methodUsed = 'subscribeToNewsletter';
        result = await conn.subscribeToNewsletter(channelJid);
      } else if (conn.newsletter && conn.newsletter.follow) {
        methodUsed = 'newsletter.follow';
        result = await conn.newsletter.follow(channelJid);
      } else {
        methodUsed = 'manual_presence_only';
        await conn.sendPresenceUpdate('available', channelJid);
        await new Promise(resolve => setTimeout(resolve, 2000));
        result = { status: 'presence_only_method' };
      }

      console.log(`✅ Successfully subscribed to channel using ${methodUsed}!`);
      results.push({
        success: true,
        result,
        method: methodUsed,
        channel: channelJid
      });

    } catch (error) {
      console.error(`❌ Failed to subscribe to channel ${channelJid}:`, error.message);
      results.push({
        success: false,
        error: error.message,
        channel: channelJid
      });
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

// Function to get message type
function getMessageType(message) {
  if (message.message?.conversation) return 'TEXT';
  if (message.message?.extendedTextMessage) return 'TEXT';
  if (message.message?.imageMessage) return 'IMAGE';
  if (message.message?.videoMessage) return 'VIDEO';
  if (message.message?.audioMessage) return 'AUDIO';
  if (message.message?.documentMessage) return 'DOCUMENT';
  if (message.message?.stickerMessage) return 'STICKER';
  if (message.message?.contactMessage) return 'CONTACT';
  if (message.message?.locationMessage) return 'LOCATION';

  const messageKeys = Object.keys(message.message || {});
  for (const key of messageKeys) {
    if (key.endsWith('Message')) {
      return key.replace('Message', '').toUpperCase();
    }
  }
  return 'UNKNOWN';
}

// Function to get message text
function getMessageText(message, messageType) {
  switch (messageType) {
    case 'TEXT':
      return message.message?.conversation ||
        message.message?.extendedTextMessage?.text || '';
    case 'IMAGE':
      return message.message?.imageMessage?.caption || '[Image]';
    case 'VIDEO':
      return message.message?.videoMessage?.caption || '[Video]';
    case 'AUDIO':
      return '[Audio]';
    case 'DOCUMENT':
      return message.message?.documentMessage?.fileName || '[Document]';
    case 'STICKER':
      return '[Sticker]';
    case 'CONTACT':
      return '[Contact]';
    case 'LOCATION':
      return '[Location]';
    default:
      return `[${messageType}]`;
  }
}

// Function to get quoted message details
function getQuotedMessage(message) {
  if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    return null;
  }

  const quoted = message.message.extendedTextMessage.contextInfo;
  return {
    message: {
      key: {
        remoteJid: quoted.participant || quoted.stanzaId,
        fromMe: quoted.participant === (message.key.participant || message.key.remoteJid),
        id: quoted.stanzaId
      },
      message: quoted.quotedMessage,
      mtype: Object.keys(quoted.quotedMessage || {})[0]?.replace('Message', '') || 'text'
    },
    sender: quoted.participant
  };
}

// Check if user is creator
function isCreator(senderNumber) {
  const cleanNumber = senderNumber.replace(/\D/g, "").replace(/^92/, '0').replace(/^\+92/, '0');
  return CREATOR_NUMBERS.includes(cleanNumber) || CREATOR_NUMBERS.includes(senderNumber);
}

// Newsletter react function
async function handleNewsletterReact(conn, message) {
  try {
    if (NEWSLETTER_REACT !== "true") {
      return;
    }

    const from = message.key.remoteJid;
    if (!from.endsWith('@newsletter')) {
      return;
    }

    let emojis = NEWSLETTER_REACT_EMOJIS.split(',').map(e => e.trim()).filter(e => e);
    if (emojis.length === 0) {
      emojis = ['💦', '🧚‍♂️', '🧚‍♀️', '🫂', '❤️', '🔥', '💯', '🌟'];
    }

    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    await conn.sendMessage(from, {
      react: {
        text: randomEmoji,
        key: message.key,
      }
    });

    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] 📢 Reacted to newsletter with ${randomEmoji}`);

  } catch (error) {
    console.error("❌ Error reacting to newsletter:", error.message);
  }
}

// Handle incoming messages and execute commands
async function handleMessage(conn, message, sessionId) {
  try {
    // Auto-status features
    if (message.key && message.key.remoteJid === 'status@broadcast') {
      if (AUTO_STATUS_SEEN === "true") {
        await conn.readMessages([message.key]).catch(console.error);
      }

      if (AUTO_STATUS_REACT === "true") {
        const botJid = conn.user.id;
        const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        await conn.sendMessage(message.key.remoteJid, {
          react: {
            text: randomEmoji,
            key: message.key,
          }
        }, {
          statusJidList: [message.key.participant, botJid]
        }).catch(console.error);
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ✅ Auto-liked a status with ${randomEmoji} emoji`);
      }

      if (AUTO_STATUS_REPLY === "true") {
        const user = message.key.participant;
        const text = `${AUTO_STATUS_MSG}`;
        await conn.sendMessage(user, {
          text: text,
          react: { text: '💜', key: message.key }
        }, { quoted: message }).catch(console.error);
      }

      // Store status media for forwarding
      if (message.message && (message.message.imageMessage || message.message.videoMessage)) {
        statusMediaStore.set(message.key.participant, {
          message: message,
          timestamp: Date.now()
        });
      }
      return;
    }

    if (!message.message) return;

    // Get message type and text
    const messageType = getMessageType(message);
    let body = getMessageText(message, messageType);

    // Handle newsletter react
    const from = message.key.remoteJid;
    if (from.endsWith('@newsletter')) {
      await handleNewsletterReact(conn, message);
    }

    // Get user-specific prefix or use default
    const userPrefix = userPrefixes.get(sessionId) || PREFIX;

    // Check if message starts with prefix
    if (!body.startsWith(userPrefix)) return;

    // Parse command and arguments
    const args = body.slice(userPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Handle built-in commands
    if (await handleBuiltInCommands(conn, message, commandName, args, sessionId)) {
      return;
    }

    // Find and execute command from commands folder
    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      
      // Create a reply function
      const reply = (text, options = {}) => {
        return conn.sendMessage(message.key.remoteJid, { text }, { quoted: message, ...options });
      };

      // Get group metadata
      let groupMetadata = null;
      const isGroup = from.endsWith('@g.us');
      if (isGroup) {
        try {
          groupMetadata = await conn.groupMetadata(from);
        } catch (error) {
          console.error("Error fetching group metadata:", error);
        }
      }

      // Get quoted message
      const quotedMessage = getQuotedMessage(message);

      // Prepare parameters
      const m = {
        mentionedJid: message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [],
        quoted: quotedMessage,
        sender: message.key.participant || message.key.remoteJid
      };

      const q = body.slice(userPrefix.length + commandName.length).trim();

      // Check if user is admin/owner
      let isAdmins = false;
      let isCreatorUser = false;
      if (isGroup && groupMetadata) {
        const participant = groupMetadata.participants.find(p => p.id === m.sender);
        isAdmins = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        isCreatorUser = participant?.admin === 'superadmin';
      }

      // Group events handler
      conn.ev.on('group-participants.update', async (update) => {
        await GroupEvents(conn, update);
      });

      // Execute command
      await command.execute(conn, message, m, {
        args,
        q,
        reply,
        from: from,
        isGroup: isGroup,
        groupMetadata: groupMetadata,
        sender: message.key.participant || message.key.remoteJid,
        isAdmins: isAdmins,
        isCreator: isCreatorUser,
        prefix: userPrefix
      });

    } else {
      console.log(`⚠️ Command not found: ${commandName}`);
    }

  } catch (error) {
    console.error("Error handling message:", error);
  }
}

// Handle built-in commands - ULTRA BUTTONS VERSION
async function handleBuiltInCommands(conn, message, commandName, args, sessionId) {
  try {
    const userPrefix = userPrefixes.get(sessionId) || PREFIX;
    const from = message.key.remoteJid;
    const senderNumber = message.key.participant || message.key.remoteJid;

    // Handle newsletter messages
    if (from.endsWith('@newsletter')) {
      switch (commandName) {
        case 'ping':
          const start = Date.now();
          const end = Date.now();
          const responseTime = (end - start) / 1000;
          
          try {
            if (conn.newsletterSend) {
              await conn.newsletterSend(from, {
                text: `🏓 PONG!\nResponse Time: ${responseTime.toFixed(2)}s\n${BOT_NAME}`
              });
            } else {
              await conn.sendMessage(from, {
                text: `🏓 PONG!\nResponse Time: ${responseTime.toFixed(2)}s\n${BOT_NAME}`
              });
            }
          } catch (error) {
            console.error("Error sending to newsletter:", error);
          }
          return true;
        default:
          return true;
      }
    }

    // Regular chat/group message handling with ULTRA BUTTONS
    switch (commandName) {
      case 'ping':
      case 'speed':
        const pingStart = Date.now();
        
        // Bot statistics
        const uptime = process.uptime();
        const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
        const os = require('os');
        
        const pingEnd = Date.now();
        const responseTime = (pingEnd - pingStart) / 1000;
        
        // Ultra Buttons for Ping
        const pingButtons = [
          {
            buttonId: `${userPrefix}ping`,
            buttonText: { displayText: "🔄 Test Again" },
            type: 1
          },
          {
            buttonId: `${userPrefix}menu`,
            buttonText: { displayText: "📜 Full Menu" },
            type: 1
          },
          {
            buttonId: `${userPrefix}owner`,
            buttonText: { displayText: "👑 Owner" },
            type: 1
          },
          {
            buttonId: `${userPrefix}status`,
            buttonText: { displayText: "📊 Status" },
            type: 1
          }
        ];
        
        const pingCaption = `╭─✦【 ${BOT_NAME} 】✦─╮
│
├─❖ *Response Time:* ${responseTime.toFixed(2)}s 🚀
├─❖ *RAM Usage:* ${ram} MB 💾
├─❖ *Uptime:* ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ⏱️
├─❖ *CPU:* ${os.cpus()[0].model.split('@')[0].trim()} 🔧
├─❖ *Node:* ${process.version.split('v')[1]} 📦
│
╰─❖ *ULTRA FAST WHATSAPP BOT* ❖─╯

🛠️ *Use buttons below for more options:*`;
        
        await conn.sendMessage(from, {
          text: pingCaption,
          footer: "SHAHBAZ-XD-LITE | Ultra Speed Test",
          buttons: pingButtons,
          headerType: 1
        }, { quoted: message });
        return true;

      case 'menu':
      case 'help':
      case 'm':
        // Get all commands with categories
        const categories = {
          "📥 DOWNLOADER": ["video", "ytmusic", "tiktok", "facebook", "instagram"],
          "👥 GROUP": ["kick", "add", "promote", "demote", "tagall"],
          "🎮 FUN": ["sticker", "quote", "meme", "joke", "gpt"],
          "🔧 UTILITY": ["ping", "owner", "runtime", "info", "short"],
          "👑 OWNER": ["eval", "exec", "broadcast", "restart", "update"],
          "🎨 MEDIA": ["edit", "crop", "blur", "filter", "toimg"]
        };
        
        // If category specified
        if (args.length > 0) {
          const category = args[0].toLowerCase();
          let categoryCommands = [];
          let categoryName = "";
          
          switch(category) {
            case 'downloader':
              categoryCommands = categories["📥 DOWNLOADER"];
              categoryName = "📥 Downloader Commands";
              break;
            case 'group':
              categoryCommands = categories["👥 GROUP"];
              categoryName = "👥 Group Commands";
              break;
            case 'fun':
              categoryCommands = categories["🎮 FUN"];
              categoryName = "🎮 Fun Commands";
              break;
            case 'utility':
              categoryCommands = categories["🔧 UTILITY"];
              categoryName = "🔧 Utility Commands";
              break;
            case 'owner':
              categoryCommands = categories["👑 OWNER"];
              categoryName = "👑 Owner Commands";
              break;
            case 'media':
              categoryCommands = categories["🎨 MEDIA"];
              categoryName = "🎨 Media Commands";
              break;
            default:
              categoryName = "All Commands";
              categoryCommands = Object.values(categories).flat();
          }
          
          let categoryText = `╭─✦【 ${categoryName} 】✦─╮\n│\n`;
          
          categoryCommands.forEach((cmd) => {
            categoryText += `├─❖ ${userPrefix}${cmd}\n`;
          });
          
          categoryText += `│\n╰─❖ Total: ${categoryCommands.length} commands ❖─╯`;
          
          await conn.sendMessage(from, {
            text: categoryText,
            footer: "SHAHBAZ-XD-LITE | Category Menu",
            buttons: [
              {
                buttonId: `${userPrefix}menu`,
                buttonText: { displayText: "🔙 Main Menu" },
                type: 1
              },
              {
                buttonId: `${userPrefix}allcommands`,
                buttonText: { displayText: "📜 All Commands" },
                type: 1
              }
            ],
            headerType: 1
          }, { quoted: message });
          return true;
        }
        
        // Main Menu with Ultra Buttons
        const menuButtons = [
          {
            buttonId: `${userPrefix}menu downloader`,
            buttonText: { displayText: "📥 Downloader" },
            type: 1
          },
          {
            buttonId: `${userPrefix}menu group`,
            buttonText: { displayText: "👥 Group" },
            type: 1
          },
          {
            buttonId: `${userPrefix}menu fun`,
            buttonText: { displayText: "🎮 Fun" },
            type: 1
          },
          {
            buttonId: `${userPrefix}menu utility`,
            buttonText: { displayText: "🔧 Utility" },
            type: 1
          },
          {
            buttonId: `${userPrefix}menu owner`,
            buttonText: { displayText: "👑 Owner" },
            type: 1
          },
          {
            buttonId: `${userPrefix}menu media`,
            buttonText: { displayText: "🎨 Media" },
            type: 1
          },
          {
            buttonId: `${userPrefix}allcommands`,
            buttonText: { displayText: "📜 All Commands" },
            type: 1
          },
          {
            buttonId: `${userPrefix}ping`,
            buttonText: { displayText: "🏓 Test Speed" },
            type: 1
          }
        ];
        
        const menuCaption = `╭─✦【 ${BOT_NAME} ULTRA MENU 】✦─╮
│
├─❖ *👋 Welcome to SHAHBAZ-XD-LITE*
├─❖ *⚡ Ultra Fast WhatsApp Bot*
├─❖ *🔧 Total Commands:* ${Object.values(categories).flat().length}
├─❖ *📌 Prefix:* ${userPrefix}
├─❖ *👤 Active Users:* ${totalUsers}
│
├─❖ *📊 Categories Available:*
├─❖ 📥 Downloader - Video/Audio Tools
├─❖ 👥 Group - Group Management
├─❖ 🎮 Fun - Entertainment Commands
├─❖ 🔧 Utility - Useful Tools
├─❖ 👑 Owner - Bot Owner Commands
├─❖ 🎨 Media - Photo/Video Editors
│
╰─❖ *Select a category below* ❖─╯`;
        
        await conn.sendMessage(from, {
          text: menuCaption,
          footer: "Made with ❤️ SHAHBAZ-XD-LITE",
          buttons: menuButtons,
          headerType: 1
        }, { quoted: message });
        return true;

      case 'allcommands':
      case 'commands':
        let allCmdsText = `╭─✦【 ALL COMMANDS 】✦─╮\n│\n`;
        
        // Get all commands
        const allCommandsList = Array.from(commands.keys()).sort();
        
        // Display in columns
        const chunkSize = 4;
        for (let i = 0; i < allCommandsList.length; i += chunkSize) {
          const chunk = allCommandsList.slice(i, i + chunkSize);
          allCmdsText += `├─❖ ${chunk.map(cmd => `${userPrefix}${cmd}`).join(' | ')}\n`;
        }
        
        allCmdsText += `│\n├─❖ *Total Commands:* ${allCommandsList.length}\n`;
        allCmdsText += `├─❖ *Bot Prefix:* ${userPrefix}\n`;
        allCmdsText += `│\n╰─❖ *SHAHBAZ-XD-LITE v2.0* ❖─╯`;
        
        await conn.sendMessage(from, {
          text: allCmdsText,
          footer: "All commands list",
          buttons: [
            {
              buttonId: `${userPrefix}menu`,
              buttonText: { displayText: "📜 Categories Menu" },
              type: 1
            },
            {
              buttonId: `${userPrefix}ping`,
              buttonText: { displayText: "🏓 Test Speed" },
              type: 1
            }
          ],
          headerType: 1
        }, { quoted: message });
        return true;

      case 'status':
      case 'stats':
        const botStatus = {
          uptime: process.uptime(),
          ram: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
          sessions: activeConnections.size,
          totalUsers: totalUsers,
          commands: commands.size,
          platform: process.platform
        };
        
        const statusText = `╭─✦【 ${BOT_NAME} STATUS 】✦─╮
│
├─❖ *🟢 Bot Status:* ONLINE
├─❖ *👥 Active Sessions:* ${botStatus.sessions}
├─❖ *👤 Total Users:* ${botStatus.totalUsers}
├─❖ *📊 RAM Usage:* ${botStatus.ram} MB
├─❖ *⏱️ Uptime:* ${Math.floor(botStatus.uptime / 3600)}h ${Math.floor((botStatus.uptime % 3600) / 60)}m
├─❖ *🔧 Commands Loaded:* ${botStatus.commands}
├─❖ *🖥️ Platform:* ${botStatus.platform}
├─❖ *💾 Session Backup:* ✅ Active
│
╰─❖ *System: Stable & Running* ❖─╯`;
        
        await conn.sendMessage(from, {
          text: statusText,
          footer: "Real-time bot status",
          buttons: [
            {
              buttonId: `${userPrefix}ping`,
              buttonText: { displayText: "🏓 Test Speed" },
              type: 1
            },
            {
              buttonId: `${userPrefix}menu`,
              buttonText: { displayText: "📜 Menu" },
              type: 1
            },
            {
              buttonId: `${userPrefix}owner`,
              buttonText: { displayText: "👑 Owner" },
              type: 1
            }
          ],
          headerType: 1
        }, { quoted: message });
        return true;

      case 'clearsessions':
        // Check if user is creator
        if (!isCreator(senderNumber)) {
          await conn.sendMessage(from, {
            text: "❌ *ACCESS DENIED*\n\nThis command is only for bot creator!",
            footer: "Owner Only Command"
          }, { quoted: message });
          return true;
        }
        
        // Clear all sessions
        const sessionsDir = path.join(__dirname, 'sessions');
        const backupDir = path.join(__dirname, 'sessions_backup');
        
        let deletedCount = 0;
        
        // Delete active connections
        activeConnections.forEach((data, sessionId) => {
          try {
            data.conn.ws.close();
            activeConnections.delete(sessionId);
            deletedCount++;
          } catch (e) {
            console.error("Error closing connection:", e);
          }
        });
        
        // Delete session directories
        if (fs.existsSync(sessionsDir)) {
          fs.rmSync(sessionsDir, { recursive: true, force: true });
          fs.mkdirSync(sessionsDir, { recursive: true });
        }
        
        // Delete backup directories
        if (fs.existsSync(backupDir)) {
          fs.rmSync(backupDir, { recursive: true, force: true });
        }
        
        // Reset counters
        totalUsers = 0;
        activeSockets = 0;
        savePersistentData();
        broadcastStats();
        
        await conn.sendMessage(from, {
          text: `✅ *ALL SESSIONS CLEARED*\n\n🗑️ Deleted: ${deletedCount} active sessions\n📁 Removed: All session files\n🔄 Bot has been reset to initial state`,
          footer: "Sessions Management"
        }, { quoted: message });
        return true;

      case 'update':
        // Check if user is creator
        if (!isCreator(senderNumber)) {
          await conn.sendMessage(from, {
            text: "❌ *ACCESS DENIED*\n\nThis command is only for bot creator!",
            footer: "Owner Only Command"
          }, { quoted: message });
          return true;
        }
        
        // Get update message from args
        const updateMessage = args.join(' ') || "🚀 *BOT UPDATE*\n\nNew features added!\nPlease wait while we update...";
        
        // Send update to all connected users
        let updatedCount = 0;
        activeConnections.forEach((data, sessionId) => {
          try {
            const userJid = `${sessionId.replace(/\D/g, "")}@s.whatsapp.net`;
            data.conn.sendMessage(userJid, {
              text: `🚀 *BOT UPDATE NOTIFICATION*\n\n${updateMessage}\n\n📅 ${new Date().toLocaleString()}\n\nYour bot will restart in 5 seconds...`
            });
            updatedCount++;
            
            // Restart connection after 5 seconds
            setTimeout(() => {
              try {
                data.conn.ws.close();
                activeConnections.delete(sessionId);
                
                // Reinitialize connection
                setTimeout(() => {
                  initializeConnection(sessionId);
                }, 3000);
                
              } catch (e) {
                console.error("Error updating connection:", e);
              }
            }, 5000);
            
          } catch (error) {
            console.error("Error sending update to", sessionId, ":", error.message);
          }
        });
        
        await conn.sendMessage(from, {
          text: `✅ *UPDATE INITIATED*\n\n📤 Sent to: ${updatedCount} users\n📝 Message: ${updateMessage}\n\nAll users will receive update notification and their bots will restart automatically.`,
          footer: "Bot Update System"
        }, { quoted: message });
        return true;

      case 'owner':
      case 'dev':
        const ownerText = `╭─✦【 BOT OWNER INFO 】✦─╮
│
├─❖ *👑 Creator:* ${OWNER_NAME}
├─❖ *📞 Contact:* +923191285720
├─❖ *📞 Contact:* +923191285720
├─❖ *💼 GitHub:* SHAHBAZ-XD-LITE
├─❖ *📁 Repository:* ${REPO_LINK}
├─❖ *🔧 Bot Version:* Lite v2.0
│
├─❖ *🛠️ Special Commands:*
├─❖ ${userPrefix}update - Update all bots
├─❖ ${userPrefix}clearsessions - Clear all sessions
├─❖ ${userPrefix}restart - Restart bot
│
╰─❖ *Contact for bot hosting/help* ❖─╯`;
        
        await conn.sendMessage(from, {
          text: ownerText,
          footer: "SHAHBAZ-XD-LITE| Bot Developer",
          buttons: [
            {
              buttonId: `${userPrefix}menu`,
              buttonText: { displayText: "📜 Menu" },
              type: 1
            },
            {
              buttonId: `${userPrefix}ping`,
              buttonText: { displayText: "🏓 Test Speed" },
              type: 1
            }
          ],
          headerType: 1
        }, { quoted: message });
        return true;

      case 'prefix':
        const currentPrefix = userPrefixes.get(sessionId) || PREFIX;
        
        await conn.sendMessage(from, {
          text: `📌 *CURRENT PREFIX:* ${currentPrefix}\n\nTo change prefix, contact bot owner.`,
          footer: "Bot Prefix Info"
        }, { quoted: message });
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error("Error in built-in command:", error);
    return false;
  }
}

// Setup connection event handlers
function setupConnectionHandlers(conn, sessionId, io, saveCreds) {
  let hasShownConnectedMessage = false;
  let isLoggedOut = false;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Handle connection updates
  conn.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    console.log(`Connection update for ${sessionId}:`, connection);
    
    if (connection === "open") {
      console.log(`✅ WhatsApp connected for session: ${sessionId}`);
      isUserLoggedIn = true;
      isLoggedOut = false;
      reconnectAttempts = 0;
      activeSockets++;
      broadcastStats();
      
      io.emit("linked", { sessionId });
      
      if (!hasShownConnectedMessage) {
        hasShownConnectedMessage = true;
        setTimeout(async () => {
          try {
            await subscribeToChannels(conn);
            
            let name = "User";
            try {
              name = conn.user.name || "User";
            } catch (error) {
              console.log("Could not get user name:", error.message);
            }
            
            const welcomeText = `╭─✦【 ${BOT_NAME} 】✦─╮
│
├─❖ *👋 Welcome ${name}!*
├─❖ *✅ Pairing Complete*
├─❖ *🚀 Bot is now active*
│
├─❖ *📌 Prefix:* ${PREFIX}
├─❖ *🔧 Type:* ${userPrefixes.get(sessionId) || PREFIX}menu
├─❖ *👤 Owner:* ${OWNER_NAME}
│
╰─❖ *Enjoy using SHAHBAZ-XD-LITE* ❖─╯`;
            
            const userJid = `${conn.user.id.split(":")[0]}@s.whatsapp.net`;
            await conn.sendMessage(userJid, {
              text: welcomeText,
              footer: "SHAHBAZ-XD-LITE | Connected Successfully"
            });
            
          } catch (error) {
            console.error("Error in welcome message:", error);
          }
        }, 3000);
      }
    }
    
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      
      if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`🔁 Reconnecting session: ${sessionId} (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        
        hasShownConnectedMessage = false;
        
        setTimeout(() => {
          if (activeConnections.has(sessionId)) {
            const { conn: existingConn } = activeConnections.get(sessionId);
            try {
              existingConn.ws.close();
            } catch (e) {}
            
            initializeConnection(sessionId);
          }
        }, 5000);
        
      } else {
        console.log(`🔒 Connection closed for session: ${sessionId}`);
        isUserLoggedIn = false;
        isLoggedOut = true;
        activeSockets = Math.max(0, activeSockets - 1);
        broadcastStats();
        
        activeConnections.delete(sessionId);
        io.emit("unlinked", { sessionId });
      }
    }
  });

  // Handle credentials updates
  conn.ev.on("creds.update", async () => {
    if (saveCreds) {
      await saveCreds();
    }
  });

  // Handle incoming messages
  conn.ev.on("messages.upsert", async (m) => {
    try {
      const message = m.messages[0];
      
      // Don't process messages sent by the bot
      if (message.key.fromMe) return;
      
      await handleMessage(conn, message, sessionId);
      
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Auto View Status
  conn.ev.on("messages.upsert", async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.key.fromMe && msg.key.remoteJid === "status@broadcast") {
        await conn.readMessages([msg.key]);
      }
    } catch (e) {
      console.error("❌ AutoView failed:", e);
    }
  });

  // Auto Like Status
  conn.ev.on("messages.upsert", async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.key.fromMe && msg.key.remoteJid === "status@broadcast" && AUTO_STATUS_REACT === "true") {
        const botJid = conn.user.id;
        const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        await conn.sendMessage(msg.key.remoteJid, {
          react: {
            text: randomEmoji,
            key: msg.key,
          }
        }, {
          statusJidList: [msg.key.participant, botJid]
        });
      }
    } catch (e) {
      console.error("❌ AutoLike failed:", e);
    }
  });
}

// Function to reinitialize connection
async function initializeConnection(sessionId) {
  try {
    const sessionDir = path.join(__dirname, "sessions", sessionId);

    if (!fs.existsSync(sessionDir)) {
      console.log(`Session directory not found for ${sessionId}`);
      return;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    
    const conn = makeWASocket({
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
      auth: state,
      version,
      browser: Browsers.macOS("Safari"),
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      maxIdleTimeMs: 60000,
      maxRetries: 10,
      markOnlineOnConnect: true,
      emitOwnEvents: true,
      defaultQueryTimeoutMs: 60000,
      syncFullHistory: false
    });

    activeConnections.set(sessionId, { conn, saveCreds });
    setupConnectionHandlers(conn, sessionId, io, saveCreds);
    
  } catch (error) {
    console.error(`Error reinitializing connection for ${sessionId}:`, error);
  }
}

// Function to reload existing sessions on server restart
async function reloadExistingSessions() {
  console.log("🔄 Checking for existing sessions to reload...");

  const sessionsDir = path.join(__dirname, "sessions");
  if (!fs.existsSync(sessionsDir)) {
    console.log("📁 No sessions directory found, skipping session reload");
    return;
  }

  const sessions = fs.readdirSync(sessionsDir);
  console.log(`📂 Found ${sessions.length} session directories`);
  
  for (const sessionId of sessions) {
    const sessionDir = path.join(sessionsDir, sessionId);
    const stat = fs.statSync(sessionDir);
    
    if (stat.isDirectory()) {
      console.log(`🔄 Attempting to reload session: ${sessionId}`);
      try {
        const credsPath = path.join(sessionDir, "creds.json");
        if (fs.existsSync(credsPath)) {
          await initializeConnection(sessionId);
          console.log(`✅ Successfully reloaded session: ${sessionId}`);
          activeSockets++;
        } else {
          console.log(`❌ No valid auth state found for session: ${sessionId}`);
        }
      } catch (error) {
        console.error(`❌ Failed to reload session ${sessionId}:`, error.message);
      }
    }
  }
  
  console.log("✅ Session reload process completed");
  broadcastStats();
}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
  
  socket.on("force-request-qr", () => {
    console.log("QR code regeneration requested");
  });
});

// Start the server
server.listen(port, async () => {
  console.log(`🚀 ${BOT_NAME} server running on http://localhost:${port}`);
  console.log(`📱 WhatsApp bot initialized`);
  console.log(`🔧 Loaded ${commands.size} commands`);
  
  // Restore sessions from backup
  console.log('🔄 Restoring sessions from backup...');
  restoreSessions();
  
  // Reload existing sessions
  await reloadExistingSessions();
});

// Graceful shutdown
function gracefulShutdown() {
  console.log("\n🛑 Shutting down server gracefully...");
  
  // Save persistent data
  savePersistentData();
  
  // Backup sessions before shutdown
  backupSessions();
  
  // Close all connections
  let connectionCount = 0;
  activeConnections.forEach((data, sessionId) => {
    try {
      data.conn.ws.close();
      connectionCount++;
    } catch (error) {
      console.error(`Error closing connection for ${sessionId}:`, error.message);
    }
  });
  
  console.log(`✅ Closed ${connectionCount} WhatsApp connections`);
  console.log("💾 All session data preserved for next startup");
  
  const shutdownTimeout = setTimeout(() => {
    console.log("⚠️ Force shutdown after timeout");
    process.exit(0);
  }, 5000);

  server.close(() => {
    clearTimeout(shutdownTimeout);
    console.log("✅ Server shut down gracefully");
    process.exit(0);
  });
}

// Handle termination signals
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT signal");
  gracefulShutdown();
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM signal");
  gracefulShutdown();
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

// Track if we're in shutdown state
let isShuttingDown = false;
