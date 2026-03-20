const express = require("express");
const cors = require("cors");
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
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

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
            lastUpdated: new Date().toISOString()
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

// Channel configuration - Updated with new JID and better formatting
const CHANNEL_JIDS = process.env.CHANNEL_JIDS ? process.env.CHANNEL_JIDS.split(',') : [
    "120363424231270188@newsletter'",
    "120363424231270188@newsletter",
    "120363424231270188@newsletter"
];

// Default prefix for bot commands
let PREFIX = process.env.PREFIX || ".";
// 🔒 Bot mode: private | public
let BOT_MODE = "public"; // default public
global.BOT_MODE = BOT_MODE;

setInterval(() => {
  BOT_MODE = global.BOT_MODE;
}, 2000);

// Bot configuration from environment variables
const BOT_NAME = process.env.BOT_NAME || "SHAHBAZ-XD-LITE";
const OWNER_NAME = process.env.OWNER_NAME || "SHAHBAZ-XD-LITE";
const MENU_IMAGE_URL = process.env.MENU_IMAGE_URL || "https://files.catbox.moe/ob2dvy.jpg";
const REPO_LINK = process.env.REPO_LINK || "https://github.com/shahzebyc3/SHAHBAZ-XD-LITE";

// Auto-status configuration
const AUTO_STATUS_SEEN = process.env.AUTO_STATUS_SEEN || "true";
const AUTO_STATUS_REACT = process.env.AUTO_STATUS_REACT || "true";
const AUTO_STATUS_REPLY = process.env.AUTO_STATUS_REPLY || "true";
const AUTO_STATUS_MSG = process.env.AUTO_STATUS_MSG || "_sᴛᴀᴛᴜs sᴇᴇɴ ʙʏ SHAHBAZ-XD-LITE_";
const DEV = process.env.DEV || 'SHAHBAZ-XD-LITE';

// Newsletter react configuration
const NEWSLETTER_REACT = process.env.NEWSLETTER_REACT || "true";
const NEWSLETTER_REACT_EMOJIS = process.env.NEWSLETTER_REACT_EMOJIS || "💦,🧚‍♂️,🧚‍♀️,🫂";

// Track login state globally
let isUserLoggedIn = false;

// Load commands from commands folder
const commands = new Map();
const commandsPath = path.join(__dirname, 'plugins');

// Modified loadCommands function to handle multi-command files
function loadCommands() {
    commands.clear();
    
    if (!fs.existsSync(commandsPath)) {
        console.log("❌ Commands directory not found:", commandsPath);
        fs.mkdirSync(commandsPath, { recursive: true });
        console.log("✅ Created commands directory");
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => 
        file.endsWith('.js') && !file.startsWith('.')
    );

    console.log(`📂 Loading commands from ${commandFiles.length} files...`);

    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            // Clear cache to ensure fresh load
            if (require.cache[require.resolve(filePath)]) {
                delete require.cache[require.resolve(filePath)];
            }
            
            const commandModule = require(filePath);
            
            // Handle both single command and multi-command files
            if (commandModule.pattern && commandModule.execute) {
                // Single command file
                commands.set(commandModule.pattern, commandModule);
                console.log(`✅ Loaded command: ${commandModule.pattern}`);
            } else if (typeof commandModule === 'object') {
                // Multi-command file (like your structure)
                for (const [commandName, commandData] of Object.entries(commandModule)) {
                    if (commandData.pattern && commandData.execute) {
                        commands.set(commandData.pattern, commandData);
                        console.log(`✅ Loaded command: ${commandData.pattern}`);
                        
                        // Also add aliases if they exist
                        if (commandData.alias && Array.isArray(commandData.alias)) {
                            commandData.alias.forEach(alias => {
                                commands.set(alias, commandData);
                                console.log(`✅ Loaded alias: ${alias} -> ${commandData.pattern}`);
                            });
                        }
                    }
                }
            } else {
                console.log(`⚠️ Skipping ${file}: invalid command structure`);
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

        // Normalize phone number
        const normalizedNumber = number.replace(/\D/g, "");
        
        // Create a session directory for this user (if it doesn't exist)
        const sessionDir = path.join(__dirname, "sessions", normalizedNumber);
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
            console.log(`📁 Created session directory: ${sessionDir}`);
        } else {
            console.log(`📁 Using existing session directory: ${sessionDir}`);
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

        // Check if this is a new user (first time connection)
        const isNewUser = !activeConnections.has(normalizedNumber) && 
                         !fs.existsSync(path.join(sessionDir, 'creds.json'));

        // Store the connection and saveCreds function
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
            savePersistentData(); // Save immediately for new users
        }
        
        broadcastStats();

        // Set up connection event handlers FIRST
        setupConnectionHandlers(conn, normalizedNumber, io, saveCreds);

        // Wait a moment for the connection to initialize
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Request pairing code
        const pairingCode = await conn.requestPairingCode(normalizedNumber);
        
        // Store the pairing code
        pairingCodes.set(normalizedNumber, { code: pairingCode, timestamp: Date.now() });

        // Return the pairing code to the frontend
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

// NEW: API endpoint for explicit logout with session deletion
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

        // Delete the session folder (only when user explicitly logs out)
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log(`🗑️ Session folder deleted for ${normalizedNumber} (explicit logout)`);
        
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

// Enhanced channel subscription function - Updated with simplified message
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
            } 
            else if (conn.followNewsletter) {
                methodUsed = 'followNewsletter';
                result = await conn.followNewsletter(channelJid);
            }
            else if (conn.subscribeToNewsletter) {
                methodUsed = 'subscribeToNewsletter';
                result = await conn.subscribeToNewsletter(channelJid);
            }
            else if (conn.newsletter && conn.newsletter.follow) {
                methodUsed = 'newsletter.follow';
                result = await conn.newsletter.follow(channelJid);
            }
            else {
                methodUsed = 'manual_presence_only';
                await conn.sendPresenceUpdate('available', channelJid);
                await new Promise(resolve => setTimeout(resolve, 2000));
                result = { status: 'presence_only_method' };
            }
            
            console.log(`✅ Successfully subscribed to channel using ${methodUsed}!`);
            results.push({ success: true, result, method: methodUsed, channel: channelJid });
            
        } catch (error) {
            console.error(`❌ Failed to subscribe to channel ${channelJid}:`, error.message);
            
            try {
                console.log(`🔄 Trying silent fallback subscription method for ${channelJid}...`);
                await conn.sendPresenceUpdate('available', channelJid);
                await new Promise(resolve => setTimeout(resolve, 3000));
                console.log(`✅ Used silent fallback subscription method for ${channelJid}!`);
                results.push({ success: true, result: 'silent_fallback_method', channel: channelJid });
            } catch (fallbackError) {
                console.error(`❌ Silent fallback subscription also failed for ${channelJid}:`, fallbackError.message);
                results.push({ success: false, error: fallbackError, channel: channelJid });
            }
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

// Newsletter react function - FIXED VERSION
async function handleNewsletterReact(conn, message) {
    try {
        if (NEWSLETTER_REACT !== "true") {
            console.log('📢 Newsletter react disabled');
            return;
        }
        
        const from = message.key.remoteJid;
        if (!from.endsWith('@newsletter')) {
            console.log('📢 Not a newsletter message:', from);
            return;
        }
        
        console.log('📢 Processing newsletter message for react:', from);
        
        // Get newsletter react emojis - FIXED: Use let instead of const
        let emojis = NEWSLETTER_REACT_EMOJIS.split(',').map(e => e.trim()).filter(e => e);
        if (emojis.length === 0) {
            emojis = ['💦', '🧚‍♂️', '🧚‍♀️', '🫂', '❤️', '🔥', '💯', '🌟'];
        }
        
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        console.log(`📢 Selected emoji: ${randomEmoji} for newsletter`);
        
        // Add delay to make it look natural
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        
        // Send reaction with proper error handling
        await conn.sendMessage(from, {
            react: {
                text: randomEmoji,
                key: message.key,
            }
        });
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] 📢 Successfully reacted to newsletter with ${randomEmoji} emoji`);
        
    } catch (error) {
        console.error("❌ Error reacting to newsletter:", error.message);
        console.error("❌ Full error:", error);
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
                // Get bot's JID directly from the connection object
                const botJid = conn.user.id;
                const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇿🇼', '💜', '💙', '🌝', '🖤', '💚'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await conn.sendMessage(message.key.remoteJid, {
                    react: {
                        text: randomEmoji,
                        key: message.key,
                    } 
                }, { statusJidList: [message.key.participant, botJid] }).catch(console.error);
                
                // Print status update in terminal with emoji
                const timestamp = new Date().toLocaleTimeString();
                console.log(`[${timestamp}] ✅ Auto-liked a status with ${randomEmoji} emoji`);
            }                       
            
            if (AUTO_STATUS_REPLY === "true") {
                const user = message.key.participant;
                const text = `${AUTO_STATUS_MSG}`;
                await conn.sendMessage(user, { text: text, react: { text: '💜', key: message.key } }, { quoted: message }).catch(console.error);
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

        // Handle newsletter react BEFORE command processing
        const from = message.key.remoteJid;
        if (from.endsWith('@newsletter')) {
            console.log('🔍 NEWSLETTER DETECTED:', {
                from: from,
                hasMessage: !!message.message,
                messageType: messageType,
                newsletterReactEnabled: NEWSLETTER_REACT === "true"
            });
            await handleNewsletterReact(conn, message);
        }
// 🔐 MODE CHECK (PRIVATE / PUBLIC)
const senderJid = message.key.participant || message.key.remoteJid;
const ownerJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";

if (global.BOT_MODE === "public" && senderJid !== ownerJid) {
    return; // ignore everyone except owner
}
        // Get user-specific prefix or use default
        const userPrefix = userPrefixes.get(sessionId) || PREFIX;
        
        // Check if message starts with prefix
        if (!body.startsWith(userPrefix)) return;

        // Parse command and arguments
        const args = body.slice(userPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        console.log(`🔍 Detected command: ${commandName} from user: ${sessionId}`);

        // Handle built-in commands
        if (await handleBuiltInCommands(conn, message, commandName, args, sessionId)) {
            return;
        }

        // Find and execute command from commands folder
        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            
            console.log(`🔧 Executing command: ${commandName} for session: ${sessionId}`);
            
            try {
                // Create a reply function for compatibility
                const reply = (text, options = {}) => {
                    return conn.sendMessage(message.key.remoteJid, { text }, { 
                        quoted: message, 
                        ...options 
                    });
                };
                
                // Get group metadata for group commands
                let groupMetadata = null;
                const isGroup = from.endsWith('@g.us');
                
                if (isGroup) {
                    try {
                        groupMetadata = await conn.groupMetadata(from);
                    } catch (error) {
                        console.error("Error fetching group metadata:", error);
                    }
                }
                
                // Get quoted message if exists
                const quotedMessage = getQuotedMessage(message);
                
                // Prepare parameters in the format your commands expect
                const m = {
                    mentionedJid: message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [],
                    quoted: quotedMessage,
                    sender: message.key.participant || message.key.remoteJid
                };
                
                const q = body.slice(userPrefix.length + commandName.length).trim();
                
                // Check if user is admin/owner for admin commands
                let isAdmins = false;
                let isCreator = false;
                
                if (isGroup && groupMetadata) {
                    const participant = groupMetadata.participants.find(p => p.id === m.sender);
                    isAdmins = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    isCreator = participant?.admin === 'superadmin';
                }
                
    conn.ev.on('group-participants.update', async (update) => {
    console.log("🔥 group-participants.update fired:", update);
    await GroupEvents(conn, update);

        });
        
                // Execute command with compatible parameters
                await command.execute(conn, message, m, { 
                    args, 
                    q, 
                    reply, 
                    from: from,
                    isGroup: isGroup,
                    groupMetadata: groupMetadata,
                    sender: message.key.participant || message.key.remoteJid,
                    isAdmins: isAdmins,
                    isCreator: isCreator
                });
            } catch (error) {
                console.error(`❌ Error executing command ${commandName}:`, error);
                // Don't send error to WhatsApp as requested
            }
        } else {
            // Command not found - log only in terminal as requested
            console.log(`⚠️ Command not found: ${commandName}`);
        }
    } catch (error) {
        console.error("Error handling message:", error);
        // Don't send error to WhatsApp as requested
    }
}

// Handle built-in commands - FIXED VERSION
async function handleBuiltInCommands(conn, message, commandName, args, sessionId) {
    try {
        const userPrefix = userPrefixes.get(sessionId) || PREFIX;
        const from = message.key.remoteJid;
        
        // Handle newsletter/channel messages differently
        if (from.endsWith('@newsletter')) {
            console.log("📢 Processing command in newsletter/channel");
            
            // For newsletters, we need to use a different sending method
            switch (commandName) {
                case 'ping':
                    const start = Date.now();
                    const end = Date.now();
                    const responseTime = (end - start) / 1000;
                    
                    const details = `${BOT_NAME}
                    
⏱️ ᴘɪɴɢ: ☛ *${responseTime.toFixed(2)}s* ⚡
👤 Oᴡɴᴇʀ: ☛ *${OWNER_NAME}*

> ᴀʀꜱʟᴀɴ-ᴍᴅ - ʟɪᴛᴇ`;

                    // Try to send to newsletter using proper method
                    try {
                        if (conn.newsletterSend) {
                            await conn.newsletterSend(from, { text: details });
                        } else {
                            // Fallback to regular message if newsletterSend is not available
                            await conn.sendMessage(from, { text: details });
                        }
                    } catch (error) {
                        console.error("Error sending to newsletter:", error);
                    }
                    return true;
                    
                case 'menu':
                case 'help':
                
                    // Send menu to newsletter
                    try {
                        const menu = generateMenu(userPrefix, sessionId);
                        if (conn.newsletterSend) {
                            await conn.newsletterSend(from, { text: menu });
                        } else {
                            await conn.sendMessage(from, { text: menu });
                        }
                    } catch (error) {
                        console.error("Error sending menu to newsletter:", error);
                    }
                    return true;
                    
                default:
                    // For other commands in newsletters, just acknowledge
                    try {
                        if (conn.newsletterSend) {
                            await conn.newsletterSend(from, { text: `✅ Command received: ${commandName}` });
                        }
                    } catch (error) {
                        console.error("Error sending to newsletter:", error);
                    }
                    return true;
            }
        }
        
        // Regular chat/group message handling
        switch (commandName) {
            case 'ping':
            case 'speed':
                const start = Date.now();
                const pingMsg = await conn.sendMessage(from, { 
                    text: `_🏓 ᴘᴏɴɢ! ᴄʜᴇᴄᴋɪɴɢ sᴘᴇᴇᴅ..._` 
                }, { quoted: fakevCard });
                const end = Date.now();
                
                const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
                const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

                const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
                let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

                // Ensure reaction and text emojis are different
                while (textEmoji === reactionEmoji) {
                    textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
                }

                // Send reaction
                await conn.sendMessage(from, { 
                    react: { text: textEmoji, key: message.key } 
                });

                const responseTime = (end - start) / 1000;

                const details = `⚡ *${BOT_NAME} sᴘᴇᴇᴅ ᴄʜᴇᴄᴋ* ⚡
                
⏱️ ᴘɪɴɢ: *${responseTime.toFixed(2)}s* ${reactionEmoji}
👤 ᴏᴡɴᴇʀ: *${OWNER_NAME}*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ SHAHBAZ-XD-LITE`;

                // Send ping with the requested style
                await conn.sendMessage(from, {
                    text: details,
                    contextInfo: {
                        externalAdReply: {
                            title: "⚡ SHAHBAZ-XD-LITE sᴘᴇᴇᴅ ᴛᴇsᴛ",
                            body: `${BOT_NAME} ᴘᴇғᴏʀᴍᴀɴᴄᴇ`,
                            thumbnailUrl: MENU_IMAGE_URL,
                            sourceUrl: REPO_LINK,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: fakevCard });
                return true;
                
            case 'prefix':
                // Check if user is the bot owner
                const ownerJid = conn.user.id;
                const messageSenderJid = message.key.participant || message.key.remoteJid;
                
                if (messageSenderJid !== ownerJid && !messageSenderJid.includes(ownerJid.split(':')[0])) {
                    await conn.sendMessage(from, { 
                        text: `❌ Owner only command` 
                    }, { quoted: fakevCard });
                    return true;
                }
                
                const currentPrefix = userPrefixes.get(sessionId) || PREFIX;
                await conn.sendMessage(from, { 
                    text: `📌 Current prefix: ${currentPrefix}` 
                }, { quoted: fakevCard });
                return true;
                
            case 'menu':
            case 'help':
            case 'm':
                const menu = generateMenu(userPrefix, sessionId);
                // Send menu with the requested style
                await conn.sendMessage(from, {
                    text: menu,
                    contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363424231270188@newsletter'",
                        newsletterName: "★彡[SHAHBAZ-XD-LITE]彡★",
                        serverMessageId: 200
                    },
                        externalAdReply: {
                            title: "🔮 ᴄᴍᴅ ᴍᴇɴᴜ",
                            body: `${BOT_NAME} - ᴀʟʟ ᴄᴍᴅs`,
                            thumbnailUrl: MENU_IMAGE_URL,
                            sourceUrl: REPO_LINK,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: fakevCard });
                return true;
                
            default:
                return false;
        }
    } catch (error) {
        console.error("Error in built-in command:", error);
        return false;
    }
}

// Generate menu 
function generateMenu(userPrefix, sessionId) {
    // Get commands from commands folder
    const folderCommands = [];
    for (const [pattern, command] of commands.entries()) {
        if (!folderCommands.some(cmd => cmd.name === pattern)) {
            folderCommands.push({
                name: pattern,
                category: command.category || 'other'
            });
        }
    }
    
    // Add built-in commands with categories
    const builtInCommands = [
        { name: 'ping', category: 'utility' },
        { name: 'prefix', category: 'utility' },
        { name: 'menu', category: 'utility' },
        { name: 'help', category: 'utility' },
        { name: 'arslan', category: 'utility' },
        { name: 'runtime', category: 'general' }
    ];
    
    const allCommands = [...builtInCommands, ...folderCommands];
    
    // Group by categories - CONVERT ALL TO UPPERCASE
    const commandsByCategory = {};
    allCommands.forEach(cmd => {
        const category = (cmd.category || 'other').toUpperCase();
        if (!commandsByCategory[category]) {
            commandsByCategory[category] = [];
        }
        commandsByCategory[category].push(cmd);
    });

    // Define category structure from your example with tinyfont
    const categories = [
        {
            name: "ᴀɪ",
            id: "AI",
            emoji: "🤖"
        },
        {
            name: "ᴅᴏᴡɴʟᴏᴀᴅᴇʀ", 
            id: "DOWNLOADER",
            emoji: "📥"
        },
        {
            name: "ꜰᴀɪᴛʜ",
            id: "FAITH", 
            emoji: "🙏"
        },
        {
            name: "ꜰᴜɴ",
            id: "FUN",
            emoji: "🎯"
        },
        {
            name: "ɢᴇɴᴇʀᴀʟ",
            id: "GENERAL",
            emoji: "🌐"
        },
        {
            name: "ɢʀᴏᴜᴘ",
            id: "GROUP",
            emoji: "👥"
        },
        {
            name: "ʟᴏɢᴏ",
            id: "LOGO", 
            emoji: "🎨"
        },
        {
            name: "ᴏᴛʜᴇʀ",
            id: "OTHER",
            emoji: "🧩"
        },
        {
            name: "sᴛɪᴄᴋᴇʀ",
            id: "STICKER",
            emoji: "🖼️"
        },
        {
            name: "ʀᴇᴀᴄᴛɪᴏɴs",
            id: "REACTION",
            emoji: "🙂‍↔️"
        },
        {
        name: "ᴄᴏɴᴠᴇʀᴛ",
            id: "CONVERT",
            emoji: "🔄"
        },
        {
            name: "ᴜᴛɪʟɪᴛʏ",
            id: "UTILITY",
            emoji: "🔧"
        }
    ];

    let menuText = `
╭━[ \`🤖 ${BOT_NAME}\` ]━⊷
┆⚜️ *DEV:* _+923191285720_   
╰━━━━━━━━━━⊷

  𓂀 *_ℙ𝕒𝕜𝕚𝕤𝕥𝕒𝕟𝕚_* 𓂀
  
 ✒️  ᴘʀᴇғɪx :☛ ${userPrefix}
 👤  ᴏᴡɴᴇʀ  :☛ ${OWNER_NAME}
 📊  ᴛᴏᴛᴀʟ  :☛ ${allCommands.length} ᴄᴍᴅs

> 💫 *ᴍᴇɴᴜ ɴᴀᴠɪɢᴀᴛɪᴏɴ*
*Ξ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs ʙᴇʟᴏᴡ:*
`;

    // Display categories
    categories.forEach(categoryInfo => {
        const cmds = commandsByCategory[categoryInfo.id];
        if (cmds && cmds.length > 0) {
            menuText += `\n╭═✦[ \`☛ ᴄᴍᴅs ʟɪsᴛ\`\n> `;
            menuText += `${categoryInfo.emoji} *${categoryInfo.name}*:\n`;
            
            // Sort commands alphabetically
            const sortedCmds = cmds.sort((a, b) => a.name.localeCompare(b.name));
            
            // Display commands
            sortedCmds.forEach(cmd => {
                menuText += `║ ￫ ${userPrefix}${cmd.name}\n`;
            });
            
            menuText += `╰━⊷\n`;
        }
    });

    menuText += `
💡 *ᴛɪᴘ*: Use ${userPrefix} before commands

> 🚀 ᴘᴏᴡᴇʀᴇᴅ ʙʏ SHAHBAZ-XD-LITE`;

    return menuText;
}



// Setup connection event handlers - MODIFIED TO ONLY DELETE ON EXPLICIT LOGOUT
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
        console.log(`🟢 CONNECTED — ${BOT_NAME} is now active for ${sessionId}`);
        
        isUserLoggedIn = true;
        isLoggedOut = false;
        reconnectAttempts = 0;
        activeSockets++;
        broadcastStats();
        
        // Send connected event to frontend
        io.emit("linked", { sessionId });
        
        if (!hasShownConnectedMessage) {
            hasShownConnectedMessage = true;
            
            setTimeout(async () => {
                try {
                    const subscriptionResults = await subscribeToChannels(conn);
                    
                    // UPDATED: Simplified channel status message
                    let channelStatus = "";
                    if (subscriptionResults.length > 0) {
                        channelStatus = `📢 Channels: Followed ✅\n`;
                    } else {
                        channelStatus = `📢 Channels: Not followed ❌\n`;
                    }

                    let name = "User";
                    try {
                        name = conn.user.name || "User";
                    } catch (error) {
                        console.log("Could not get user name:", error.message);
                    }
                    
                    let up = `
╭━[ \`🤖 ${BOT_NAME}\` ]━⊷
┆⚜️ *DEV:* ☛ _+923191285720_ 
╰━━━━━━━━━━⊷

👋 Hey *${name}* 🤩  
🎉 Pairing Completed – You're good to go!  

_ᴘᴏᴡᴇʀᴇᴅ ʙʏ SHAHBAZ-XD-LITE_

📌 ᴘʀᴇғɪx: ${PREFIX}  
${channelStatus}

🍴 ғᴏʀᴋ ɴ ⭐ ᴍʏ ʀᴇᴘᴏ: https://github.com/shahzebyc3/SHAHBAZ-MD/fork
                    `;

                    // Send welcome message to user's DM with proper JID format and requested style
                    const userJid = `${conn.user.id.split(":")[0]}@s.whatsapp.net`;
                    await conn.sendMessage(userJid, { 
                        text: up,
                        contextInfo: {
                            mentionedJid: [userJid],
                            forwardingScore: 999,
                            externalAdReply: {
                                title: `${BOT_NAME} Connected 🚀`,
                                body: `☛ ⚡ Powered by ${OWNER_NAME}`,
                                thumbnailUrl: MENU_IMAGE_URL,
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    });
                } catch (error) {
                    console.error("Error in channel subscription or welcome message:", error);
                }
            }, 3000);
        }
    }
    
    if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(`🔁 Connection closed, attempting to reconnect session: ${sessionId} (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            
            // Reset connected message flag to show again after reconnect
            hasShownConnectedMessage = false;
            
            // Try to reconnect after a delay
            setTimeout(() => {
                if (activeConnections.has(sessionId)) {
                    const { conn: existingConn } = activeConnections.get(sessionId);
                    try {
                        existingConn.ws.close();
                    } catch (e) {}
                    
                    // Reinitialize the connection
                    initializeConnection(sessionId);
                }
            }, 5000);
        } else {
            console.log(`🔒 Connection closed for session: ${sessionId}`);
            
            // CRITICAL FIX: Only delete session folder if user explicitly logged out via /api/logout
            const isExplicitLogout = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
            
            if (isExplicitLogout) {
                console.log(`🗑️ User explicitly logged out, deleting session folder for: ${sessionId}`);
                const sessionDir = path.join(__dirname, "sessions", sessionId);
                if (fs.existsSync(sessionDir)) {
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                    console.log(`✅ Session folder deleted for: ${sessionId}`);
                }
            } else {
                console.log(`💾 Connection closed but NOT due to explicit logout - preserving session folder for: ${sessionId}`);
                // Preserve session folder for reconnections, crashes, server restarts, etc.
            }
            
            isUserLoggedIn = false;
            isLoggedOut = true;
            activeSockets = Math.max(0, activeSockets - 1);
            broadcastStats();
            
            // Remove from active connections
            activeConnections.delete(sessionId);
            io.emit("unlinked", { sessionId });
            
            // Log preservation message if not explicit logout
            if (!isExplicitLogout) {
                const sessionDir = path.join(__dirname, "sessions", sessionId);
                if (fs.existsSync(sessionDir)) {
                    const files = fs.readdirSync(sessionDir);
                    console.log(`💾 Session ${sessionId} preserved with files:`, files);
                }
            }
        }
    }
});

    // Handle credentials updates
    conn.ev.on("creds.update", async () => {
        if (saveCreds) {
            await saveCreds();
        }
    });

    // Handle messages - FIXED: Added proper message handling for all message types
    conn.ev.on("messages.upsert", async (m) => {
        try {
            const message = m.messages[0];
            
            // Get the bot's JID in proper format
            const botJid = conn.user.id;
            const normalizedBotJid = botJid.includes(':') ? botJid.split(':')[0] + '@s.whatsapp.net' : botJid;
            
            // Check if message is from the bot itself (owner)
            const isFromBot = message.key.fromMe || 
                              (message.key.participant && message.key.participant === normalizedBotJid) ||
                              (message.key.remoteJid && message.key.remoteJid === normalizedBotJid);
            
            // Don't process messages sent by the bot unless they're from the owner account
            if (message.key.fromMe && !isFromBot) return;
            
            console.log(`📩 Received message from ${message.key.remoteJid}, fromMe: ${message.key.fromMe}, isFromBot: ${isFromBot}`);
            
            // Handle all message types (private, group, newsletter)
            const from = message.key.remoteJid;
            
            // Check if it's a newsletter message
            if (from.endsWith('@newsletter')) {
                await handleMessage(conn, message, sessionId);
            } 
            // Check if it's a group message
            else if (from.endsWith('@g.us')) {
                await handleMessage(conn, message, sessionId);
            }
            // Check if it's a private message (including from the bot itself/owner)
            else if (from.endsWith('@s.whatsapp.net') || isFromBot) {
                await handleMessage(conn, message, sessionId);
            }
            
            // Added message printing for better debugging
            const messageType = getMessageType(message);
            let messageText = getMessageText(message, messageType);
            
            if (!message.key.fromMe || isFromBot) {
                const timestamp = new Date(message.messageTimestamp * 1000).toLocaleTimeString();
                const isGroup = from.endsWith('@g.us');
                const sender = message.key.fromMe ? conn.user.id : (message.key.participant || message.key.remoteJid);
                
                if (isGroup) {
                    console.log(`[${timestamp}] [GROUP: ${from}] ${sender}: ${messageText} (${messageType})`);
                } else {
                    console.log(`[${timestamp}] [PRIVATE] ${sender}: ${messageText} (${messageType})`);
                }
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    // Auto View Status feature
    conn.ev.on("messages.upsert", async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.key.fromMe && msg.key.remoteJid === "status@broadcast") {
                await conn.readMessages([msg.key]);
                console.log("✅ Auto-viewed a status.");
            }
        } catch (e) {
            console.error("❌ AutoView failed:", e);
        }
    });

    // Auto Like Status feature
    conn.ev.on("messages.upsert", async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.key.fromMe && msg.key.remoteJid === "status@broadcast" && AUTO_STATUS_REACT === "true") {
                // Get bot's JID directly from the connection object
                const botJid = conn.user.id;
                const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇳🇬', '💜', '💙', '🌝', '🖤', '💚'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                
                await conn.sendMessage(msg.key.remoteJid, {
                    react: {
                        text: randomEmoji,
                        key: msg.key,
                    } 
                }, { statusJidList: [msg.key.participant, botJid] });
                
                // Print status update in terminal with emoji
                const timestamp = new Date().toLocaleTimeString();
                console.log(`[${timestamp}] ✅ Auto-liked a status with ${randomEmoji} emoji`);
            }
        } catch (e) {
            console.error("❌ AutoLike failed:", e);
        }
    });

    // REMOVED DUPLICATE NEWSLETTER REACT EVENT LISTENER - Only one in handleMessage
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

// MODIFIED: Cleanup function that only deletes on explicit logout
function handleSessionCleanup(sessionId, isExplicitLogout) {
    const sessionDir = path.join(__dirname, "sessions", sessionId);
    
    if (isExplicitLogout) {
        // Delete session folder only on explicit logout
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
            console.log(`🗑️ Session folder deleted for ${sessionId} (explicit logout)`);
        }
    } else {
        // Preserve session folder for other types of disconnections
        if (fs.existsSync(sessionDir)) {
            const files = fs.readdirSync(sessionDir);
            console.log(`💾 Session preserved for ${sessionId} (non-logout disconnect), files:`, files);
        }
    }
}

// API endpoint to get loaded commands
app.get("/api/plugins", (req, res) => {
    const commandList = Array.from(commands.keys());
    res.json({ commands: commandList });
});

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
                // Check if this session has valid auth state (creds.json)
                const credsPath = path.join(sessionDir, "creds.json");
                if (fs.existsSync(credsPath)) {
                    await initializeConnection(sessionId);
                    console.log(`✅ Successfully reloaded session: ${sessionId}`);
                    
                    // Count this as an active socket but don't increment totalUsers
                    activeSockets++;
                    console.log(`📊 Active sockets increased to: ${activeSockets}`);
                } else {
                    console.log(`❌ No valid auth state found for session: ${sessionId}`);
                }
            } catch (error) {
                console.error(`❌ Failed to reload session ${sessionId}:`, error.message);
            }
        }
    }
    
    console.log("✅ Session reload process completed");
    broadcastStats(); // Update stats after reloading all sessions
}


// Graceful shutdown - PRESERVES session folders
function gracefulShutdown() {
  if (isShuttingDown) {
    console.log("🛑 Shutdown already in progress...");
    return;
  }
  
  isShuttingDown = true;
  console.log("\n🛑 Shutting down TRACLE LITE server gracefully...");
  console.log("💾 PRESERVING ALL SESSION FOLDERS (server restart/shutdown)");
  
  // Save persistent data before shutting down
  savePersistentData();
  console.log(`💾 Saved persistent data: ${totalUsers} total users`);
  
  let connectionCount = 0;
  activeConnections.forEach((data, sessionId) => {
    try {
      data.conn.ws.close();
      console.log(`🔒 Closed WhatsApp connection for session: ${sessionId}`);
      connectionCount++;
      
      // PRESERVE the session folder during graceful shutdown/restart
      const sessionDir = path.join(__dirname, "sessions", sessionId);
      if (fs.existsSync(sessionDir)) {
          const files = fs.readdirSync(sessionDir);
          console.log(`💾 Preserved session folder for: ${sessionId} (files: ${files.length})`);
      }
    } catch (error) {
      console.error(`❌ Error closing connection for ${sessionId}:`, error.message);
    }
  });
  
  console.log(`✅ Closed ${connectionCount} WhatsApp connections`);
  console.log("💾 ALL SESSION FOLDERS HAVE BEEN PRESERVED");
  console.log("📁 Sessions will be automatically reloaded on next startup");
  
  const shutdownTimeout = setTimeout(() => {
    console.log("⚠️  Force shutdown after timeout");
    process.exit(0);
  }, 5000);
  
  server.close(() => {
    clearTimeout(shutdownTimeout);
    console.log("✅ Server shut down gracefully");
    console.log("💾 All session data preserved for next startup");
    process.exit(0);
  });
}
// Start the server
server.listen(port, async () => {
    console.log(`🚀 ${BOT_NAME} server running on http://localhost:${port}`);
    console.log(`📱 WhatsApp bot initialized`);
    console.log(`🔧 Loaded ${commands.size} commands`);
    
    // Reload existing sessions after server starts
    await reloadExistingSessions();
});


// Graceful shutdown - MODIFIED to preserve session folders unless explicit logout
function gracefulShutdown() {
  if (isShuttingDown) {
    console.log("🛑 Shutdown already in progress...");
    return;
  }
  
  isShuttingDown = true;
  console.log("\n🛑 Shutting down TRACLE LITE server gracefully...");
  console.log("💾 PRESERVING ALL SESSION FOLDERS (graceful shutdown)");
  
  // Save persistent data before shutting down
  savePersistentData();
  console.log(`💾 Saved persistent data: ${totalUsers} total users`);
  
  let connectionCount = 0;
  activeConnections.forEach((data, sessionId) => {
    try {
      data.conn.ws.close();
      console.log(`🔒 Closed WhatsApp connection for session: ${sessionId}`);
      connectionCount++;
      
      // PRESERVE the session folder during graceful shutdown
      const sessionDir = path.join(__dirname, "sessions", sessionId);
      if (fs.existsSync(sessionDir)) {
          console.log(`💾 Preserved session folder for: ${sessionId}`);
      }
    } catch (error) {
      console.error(`❌ Error closing connection for ${sessionId}:`, error.message);
    }
  });
  
  console.log(`✅ Closed ${connectionCount} WhatsApp connections`);
  console.log("💾 ALL SESSION FOLDERS HAVE BEEN PRESERVED");
  console.log("📁 Sessions will be automatically reloaded on next startup");
  
  const shutdownTimeout = setTimeout(() => {
    console.log("⚠️  Force shutdown after timeout");
    process.exit(0);
  }, 5000);
  
  server.close(() => {
    clearTimeout(shutdownTimeout);
    console.log("✅ Server shut down gracefully");
    console.log("💾 All session data preserved for next startup");
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
  console.log("💾 Preserving all sessions despite error");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  console.log("💾 Preserving all sessions despite rejection");
});

// Track if we're in shutdown state
let isShuttingDown = false;
