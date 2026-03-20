const axios = require("axios");
const yts = require("yt-search");
const fakevCard = require('../lib/fakevcard');

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
    }
};

async function tryRequest(getter, attempts = 3) {
    let last;
    for (let i = 1; i <= attempts; i++) {
        try {
            return await getter();
        } catch (e) {
            last = e;
            if (i < attempts) await new Promise(r => setTimeout(r, 1000 * i));
        }
    }
    throw last;
}

async function getIzumiVideoByUrl(url) {
    const api = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(url)}&format=720`;
    const res = await tryRequest(() => axios.get(api, AXIOS_DEFAULTS));
    if (res?.data?.result?.download) return res.data.result;
    throw new Error("Izumi API has no download link");
}

async function getOkatsuVideoByUrl(url) {
    const api = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(url)}`;
    const res = await tryRequest(() => axios.get(api, AXIOS_DEFAULTS));
    if (res?.data?.result?.mp4) {
        return {
            download: res.data.result.mp4,
            title: res.data.result.title
        };
    }
    throw new Error("Okatsu API has no mp4");
}

const activeReplyHandlers = new Map(); 

module.exports = {
    pattern: "video",
    alias: ["ytvideo", "ytv", "ytmp4"],
    desc: "Download YouTube videos by name or link",
    react: "🎬",
    category: "downloader",
    filename: __filename,

    execute: async (conn, mek, m, { from, args, q, reply }) => {
        try {
            const text = m?.message?.conversation || m?.message?.extendedTextMessage?.text || args.join(" ");
            const query = q || text.split(" ").slice(1).join(" ").trim();

            if (!query) {
                return await conn.sendMessage(
                    from,
                    { text: "⚠️ Please provide a video name or URL.\n\nExample:\n.video pasoori" },
                    { quoted: mek }
                );
            }

            await conn.sendMessage(from, { react: { text: "🎬", key: mek.key } });

            const search = await yts(query);
            if (!search?.videos?.length) {
                return await conn.sendMessage(from, { text: "❌ No video found!" }, { quoted: mek });
            }
            const info = search.videos[0];
            const videoUrl = info.url;

            // --- Menu Caption Updated ---
            const caption = `☘️ *𝗧ɪᴛ𝗹𝗲* ☛ *_${info.title}_*

*▫️⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻* ☛ *_${info.timestamp}_*
*▫️👁️ 𝗩𝗶𝗲𝘄𝘀* ☛ *_${info.views?.toLocaleString()}_*
*▫️👤 𝗖𝗵𝗮𝗻𝗻𝗲𝗹* ☛ *_${info.author?.name}_*

✦━━━━━━━━━━━━✦

🔢 *Reply with the number to download:*

*1 🎬 Normal Video (Gallery)*
*2 📁 Document File (File)*
*3 📹 Video Note (PTV)*

> ● *ᴘᴏᴡᴇʀᴇᴅ ʙʏ SHAHBAZ-XD-LITE* ●`;

            const sentMsg = await conn.sendMessage(
                from,
                { image: { url: info.thumbnail }, caption: caption },
                { quoted: mek }
            );

            const msgId = sentMsg.key.id;
            if (activeReplyHandlers.has(msgId)) return;

            const messageListener = async (messageUpdate) => {
                try {
                    const mekUpdate = messageUpdate.messages?.[0];
                    if (!mekUpdate?.message) return;

                    const replyTo = mekUpdate.message.extendedTextMessage?.contextInfo?.stanzaId;
                    if (replyTo !== msgId) return;

                    const choice = (mekUpdate.message.conversation || mekUpdate.message.extendedTextMessage?.text)?.trim();
                    if (!["1", "2", "3"].includes(choice)) return;

                    await conn.sendMessage(from, { react: { text: "📥", key: mekUpdate.key } });

                    let videoData;
                    try {
                        videoData = await getIzumiVideoByUrl(videoUrl);
                    } catch (e1) {
                        videoData = await getOkatsuVideoByUrl(videoUrl);
                    }

                    if (choice === "1") {
                        await conn.sendMessage(from, {
                            video: { url: videoData.download },
                            mimetype: "video/mp4",
                            caption: `*${info.title}*\n\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀʀꜱʟᴀɴ-ᴍᴅ - ʟɪᴛᴇ_`
                        }, { quoted: mek });
                    } 
                    else if (choice === "2") {
                        await conn.sendMessage(from, {
                            document: { url: videoData.download },
                            mimetype: "video/mp4",
                            fileName: `${info.title}.mp4`,
                            caption: `*${info.title}*\n\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ SHAHBAZ-XD-LITE`
                        }, { quoted: mek });
                    }
                    else if (choice === "3") {
                        await conn.sendMessage(from, {
                            video: { url: videoData.download },
                            mimetype: "video/mp4",
                            ptv: true
                        }, { quoted: mek });
                    }

                    await conn.sendMessage(from, { react: { text: "✅", key: mekUpdate.key } });

                } catch (err) {
                    console.error("Number Reply Error:", err);
                }
            };

            conn.ev.on("messages.upsert", messageListener);
            activeReplyHandlers.set(msgId, messageListener);

            // Auto-clean listener after 10 minutes
            setTimeout(() => {
                const listener = activeReplyHandlers.get(msgId);
                if (listener) {
                    conn.ev.off("messages.upsert", listener);
                    activeReplyHandlers.delete(msgId);
                }
            }, 600000);

        } catch (err) {
            console.error("Video Command Error:", err);
            await conn.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: mek });
        }
    }
};
