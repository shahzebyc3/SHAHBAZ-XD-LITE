// === ai-commands.js ===
const { fetchJson } = require('../lib/functions2');
const { fakevCard } = require('../lib/fakevcard');
const axios = require('axios');
const FormData = require('form-data');

module.exports = [
  {
    pattern: "fluxai",
    desc: "Generate an image using AI",
    category: "ai",
    react: "🖼️",
    filename: __filename,
    use: ".fluxai prompt",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply("❌ Please provide a prompt for the image. Example: .fluxai a serene beach at sunset");
        }

        const prompt = args.join(" ");
        const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(prompt)}`;
        const result = await fetchJson(apiUrl);

        if (!result?.download_url) {
          return reply("❌ Failed to generate image.");
        }

        await conn.sendMessage(from, {
          image: { url: result.download_url },
          caption: "🖼️ Your AI-Generated Image"
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "suno",
    desc: "Generate AI music with Suno",
    category: "ai",
    react: "🎵",
    filename: __filename,
    use: ".suno prompt",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply("❌ Please provide a prompt for the music. Example: .suno a happy pop song");
        }

        const prompt = args.join(" ");
        const apiUrl = `https://api.privatezia.biz.id/api/ai/suno?query=${encodeURIComponent(prompt)}`;
        const result = await fetchJson(apiUrl);

        if (!result?.status || !result?.result?.data?.length) {
          return reply("❌ Failed to generate music.");
        }

        const data = result.result.data[0];
        const audioUrl = data.audio_url;
        const imageUrl = data.image_url;
        const title = data.title;

        await conn.sendMessage(from, {
          image: { url: imageUrl },
          caption: `🎵 Your AI-Generated Music\nTitle: ${title}`
        }, { quoted: fakevCard });

        await conn.sendMessage(from, {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "gpt4",
    desc: "Generate text using GPT-4 AI",
    category: "ai",
    react: "🤖",
    filename: __filename,
    use: ".gpt4 prompt",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply("❌ Please provide a prompt for GPT-4. Example: .gpt4 who is the first president of Indonesia?");
        }

        const prompt = args.join(" ");
        const apiUrl = `https://api.privatezia.biz.id/api/ai/GPT-4?query=${encodeURIComponent(prompt)}`;
        const result = await fetchJson(apiUrl);

        if (!result?.status || !result?.response) {
          return reply("❌ Failed to generate response.");
        }

        await conn.sendMessage(from, {
          text: `🤖 Your GPT-4 Response\n\n${result.response}`
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "luminai",
    desc: "Generate text using LuminAI",
    category: "ai",
    react: "🤖",
    filename: __filename,
    use: ".luminai prompt",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply("❌ Please provide a prompt for LuminAI. Example: .luminai hello");
        }

        const prompt = args.join(" ");
        const apiUrl = `https://api.ziapanelku.my.id/ai/luminai?text=${encodeURIComponent(prompt)}`;
        const result = await fetchJson(apiUrl);

        if (!result?.status || !result?.result) {
          return reply("❌ Failed to generate response.");
        }

        await conn.sendMessage(from, {
          text: `🤖 Your LuminAI Response\n\n${result.result}`
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "metaai",
    desc: "Generate text using Meta AI",
    category: "ai",
    react: "🤖",
    filename: __filename,
    use: ".metaai prompt",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply("❌ Please provide a prompt for Meta AI. Example: .metaai what is the capital of France?");
        }

        const prompt = args.join(" ");
        const apiUrl = `https://apis.davidcyriltech.my.id/ai/metaai?text=${encodeURIComponent(prompt)}`;
        const result = await fetchJson(apiUrl);

        if (!result?.success || !result?.response) {
          return reply("❌ Failed to generate response.");
        }

        await conn.sendMessage(from, {
          text: `🤖 Your Meta AI Response\n\n${result.response}`
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "artly",
    desc: "Generate AI images with Artly",
    category: "ai",
    react: "🎨",
    filename: __filename,
    use: ".artly prompt",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply("❌ Please provide a prompt for Artly. Example: .artly a cat with a hat");
        }

        const prompt = args.join(" ");
        const form = new FormData();
        form.append('prompt', prompt);
        form.append('width', '512');
        form.append('height', '512');
        form.append('num_inference_steps', '25');

        const response = await axios.post('https://getimg-x4mrsuupda-uc.a.run.app/api-premium', form, {
          headers: {
            'user-agent': 'NB Android/1.0.0',
            'accept-encoding': 'gzip',
            'content-type': 'application/x-www-form-urlencoded',
            ...form.getHeaders()
          }
        });

        const result = response.data;

        if (!result?.url) {
          return reply("❌ Failed to generate image.");
        }

        await conn.sendMessage(from, {
          image: { url: result.url },
          caption: `🎨 Your Artly Image\nSeed: ${result.seed}\nCost: ${result.cost}`
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  },
  {
    pattern: "aiclaude",
    desc: "Get AI response from Claude API",
    category: "ai",
    react: "🤖",
    filename: __filename,
    use: ".aiclaude prompt",
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply("❌ Please provide a prompt for Claude. Example: .aiclaude tell me a story");
        }

        const prompt = args.join(" ");
        const apiUrl = `https://api.ryzendesu.vip/api/ai/claude?text=${encodeURIComponent(prompt)}`;
        const result = await fetchJson(apiUrl);

        if (!result?.response) {
          return reply("❌ Failed to generate response.");
        }

        await conn.sendMessage(from, {
          text: `🤖 Your Claude Response\n\n${result.response}`
        }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message}`);
      }
    }
  }
];