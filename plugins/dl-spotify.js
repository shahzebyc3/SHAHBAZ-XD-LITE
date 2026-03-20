const axios = require("axios");
const fakevCard = require('../lib/fakevcard');

module.exports = {
    pattern: "spotify",
    alias: ["splay", "puregana", "spote"],
    desc: "Search & Download Spotify tracks in audio format",
    react: "🎵",
    category: "downloader",
    filename: __filename,

    execute: async (conn, mek, m, { from, args, q, reply }) => {
        try {
            const query = q || args.join(" ").trim();

            if (!query) {
                return await conn.sendMessage(
                    from,
                    { text: "❎ Please provide a song name.\n\nExample:\n.spotify pasoori" },
                    { quoted: mek }
                );
            }

            // React in chat
            await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

            // ======================================================
            // 1) SEARCH SPOTIFY BEST MATCH
            // ======================================================
            const searchUrl = `https://jerrycoder.oggyapi.workers.dev/spotify?search=${encodeURIComponent(query)}`;
            const { data: searchData } = await axios.get(searchUrl, { timeout: 20000 });

            if (!searchData?.tracks?.length) {
                return await conn.sendMessage(from, { text: "❌ No song found!" }, { quoted: mek });
            }

            const best = searchData.tracks[0]; // Best match

            // ======================================================
            // 2) GET DIRECT DOWNLOAD LINK
            // ======================================================
            const dlUrl = `https://jerrycoder.oggyapi.workers.dev/dspotify?url=${encodeURIComponent(best.spotifyUrl)}`;
            const { data: dlData } = await axios.get(dlUrl, { timeout: 20000 });

            if (!dlData?.status || !dlData?.download_link) {
                return await conn.sendMessage(from, { text: "❌ Failed to fetch download link." }, { quoted: mek });
            }

            // ======================================================
            // 3) SEND SONG DETAILS
            // ======================================================
            await conn.sendMessage(from, {
                image: { url: dlData.thumbnail },
                caption: `🎵 *${dlData.title || best.trackName}*\n👤 ${dlData.artist || best.artist}\n\n⬇️ Downloading audio...`
            }, { quoted: mek });

            // ======================================================
            // 4) SEND AUDIO
            // ======================================================
            await conn.sendMessage(
                from,
                {
                    audio: { url: dlData.download_link },
                    mimetype: "audio/mpeg",
                    fileName: `${dlData.title || best.trackName}.mp3`,
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            title: dlData.title || best.trackName,
                            body: dlData.artist || best.artist,
                            thumbnailUrl: dlData.thumbnail,
                            sourceUrl: best.spotifyUrl,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: fakevCard }
            );

            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        } catch (err) {
            console.error("Spotify command error:", err);
            await conn.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: mek });
        }
    }
};
