// === brat-commands.js ===
const { fetchJson } = require('../lib/functions2');
const { fakevCard } = require('../lib/fakevcard');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = [
  {
    pattern: "bratvid",
    desc: "Create Brat style video text",
    category: "sticker",
    react: "🚀",
    filename: __filename,
    use: ".bratvid text",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply("❌ Please provide text for Brat video. Example: .bratvid hello");
        }
        if (args.join(" ").length > 250) {
          return reply("❌ Character limit exceeded, max 250!");
        }

        const words = args.join(" ").split(" ");
        const tempDir = path.join(process.cwd(), 'cache');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const framePaths = [];

        for (let i = 0; i < words.length; i++) {
          const currentText = words.slice(0, i + 1).join(" ");
          const res = await axios.get(
            `https://aqul-brat.hf.space/?text=${encodeURIComponent(currentText)}`,
            { responseType: "arraybuffer" }
          );

          const framePath = path.join(tempDir, `frame${i}.mp4`);
          fs.writeFileSync(framePath, res.data);
          framePaths.push(framePath);
        }

        const fileListPath = path.join(tempDir, "filelist.txt");
        let fileListContent = "";
        for (let i = 0; i < framePaths.length; i++) {
          fileListContent += `file '${framePaths[i]}'\n`;
          fileListContent += `duration 0.5\n`;
        }
        fileListContent += `file '${framePaths[framePaths.length - 1]}'\n`;
        fileListContent += `duration 1.5\n`;

        fs.writeFileSync(fileListPath, fileListContent);
        const outputVideoPath = path.join(tempDir, "output.mp4");

        execSync(
          `ffmpeg -y -f concat -safe 0 -i "${fileListPath}" -vf "fps=30" -c:v libx264 -preset superfast -pix_fmt yuv420p "${outputVideoPath}"`
        );

        const outputStickerPath = path.join(tempDir, "output.webp");
        execSync(
          `ffmpeg -i "${outputVideoPath}" -vf "scale=512:512:flags=lanczos,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -loop 0 -preset picture -an -vsync 0 -r 15 "${outputStickerPath}"`
        );

        const stickerBuffer = fs.readFileSync(outputStickerPath);
        await conn.sendMessage(from, {
          sticker: stickerBuffer,
          contextInfo: { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true }
        }, { quoted: fakevCard });

        framePaths.forEach((frame) => fs.existsSync(frame) && fs.unlinkSync(frame));
        if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath);
        if (fs.existsSync(outputVideoPath)) fs.unlinkSync(outputVideoPath);
        if (fs.existsSync(outputStickerPath)) fs.unlinkSync(outputStickerPath);

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "brat2",
    desc: "Generate sticker from text using Brat API",
    category: "sticker",
    react: "🚀",
    filename: __filename,
    use: ".brat2 text",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply("❌ Please provide text for Brat sticker. Example: .brat2 hello");
        }
        if (args.join(" ").length > 250) {
          return reply("❌ Character limit exceeded, max 250!");
        }

        const prompt = args.join(" ");
        const response = await axios.get(
          `https://aqul-brat.hf.space/?text=${encodeURIComponent(prompt)}`,
          { responseType: 'arraybuffer' }
        );

        const buffer = Buffer.from(response.data);
        await conn.sendMessage(from, {
          sticker: buffer,
          contextInfo: { packname: "XD", author: "Malvin" }
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  }
];