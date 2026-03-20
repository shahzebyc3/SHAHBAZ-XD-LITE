
const fakevCard = require('../lib/fakevcard');
const { fetchJson, getBuffer } = require('../lib/functions2');

module.exports = [
    {
        pattern: "3dcomic",
        desc: "Create a 3D Comic-style text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".3dcomic text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .3dcomic Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate 3D comic effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your 3D Comic Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "3dpaper",
        desc: "Create a 3D Paper text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".3dpaper text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .3dpaper Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate 3D paper effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your 3D Paper Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "america",
        desc: "Create an American text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".america text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .america Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate American effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your American Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "angelwings",
        desc: "Create an Angel Wings text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".angelwings text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .angelwings Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/angel-wing-effect-329.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate angel wings effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Angel Wings Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "bear",
        desc: "Create a Bear text effect",
        category: "logo",
        react: "🐻",
        filename: __filename,
        use: ".bear text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .bear Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-bear-logo-maker-online-673.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate bear effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🐻 Your Bear Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "birthday",
        desc: "Create a Birthday text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".birthday text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .birthday Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate birthday effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Birthday Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "blackpink",
        desc: "Create a Blackpink text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".blackpink text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .blackpink Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate blackpink effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Blackpink Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "boom",
        desc: "Create a Boom text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".boom text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .boom Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/boom-text-comic-style-text-effect-675.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate boom effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Boom Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "bulb",
        desc: "Create a Bulb text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".bulb text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .bulb Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate bulb effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Bulb Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "castle",
        desc: "Create a Castle text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".castle text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .castle Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-3d-castle-pop-out-mobile-photo-effect-786.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate castle effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Castle Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "cat",
        desc: "Create a Cat text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".cat text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .cat Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate cat effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Cat Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "clouds",
        desc: "Create a Clouds text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".clouds text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .clouds Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate clouds effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Clouds Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "deadpool",
        desc: "Create a Deadpool text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".deadpool text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .deadpool Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate deadpool effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Deadpool Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "devilwings",
        desc: "Create a Devil Wings text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".devilwings text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .devilwings Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate devil wings effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Devil Wings Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "dragonball",
        desc: "Create a Dragonball text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".dragonball text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .dragonball Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate dragonball effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Dragonball Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "eraser",
        desc: "Create an Eraser text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".eraser text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .eraser Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate eraser effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Eraser Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "frozen",
        desc: "Create a Frozen text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".frozen text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .frozen Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate frozen effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Frozen Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "futuristic",
        desc: "Create a Futuristic text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".futuristic text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .futuristic Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate futuristic effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Futuristic Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "glossysilver",
        desc: "Create a Glossy Silver text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".glossysilver text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .glossysilver Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/glossy-silver-3d-text-effect-online-794.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate glossy silver effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Glossy Silver Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "hacker",
        desc: "Create a Hacker text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".hacker text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .hacker Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate hacker effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Hacker Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "leaf",
        desc: "Create a Leaf text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".leaf text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .leaf Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate leaf effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Leaf Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "luxury",
        desc: "Create a Luxury text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".luxury text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .luxury Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/floral-luxury-logo-collection-for-branding-616.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate luxury effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Luxury Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "neonlight",
        desc: "Create a Neon Light text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".neonlight text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .neonlight Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate neon light effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Neon Light Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "nigeria",
        desc: "Create a Nigeria text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".nigeria text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .nigeria Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate nigeria effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Nigeria Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "paint",
        desc: "Create a Paint text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".paint text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .paint Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate paint effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Paint Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "pornhub",
        desc: "Create a Pornhub text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".pornhub text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .pornhub Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate pornhub effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Pornhub Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "sadgirl",
        desc: "Create a Sadgirl text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".sadgirl text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .sadgirl Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-on-wet-glass-online-589.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate sadgirl effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Sadgirl Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "sans",
        desc: "Create a Sand text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".sans text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .sans Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate sand effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Sand Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "sunset",
        desc: "Create a Sunset text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".sunset text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .sunset Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-sunset-light-text-effects-online-807.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate sunset effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Sunset Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "tatoo",
        desc: "Create a Tattoo text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".tatoo text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .tatoo Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/make-tattoos-online-by-empire-tech-309.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate tattoo effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Tattoo Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "textmaker",
        desc: "Create a Typography text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".textmaker text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .textmaker Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-typography-status-online-with-impressive-leaves-357.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate typography effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Typography Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "thor",
        desc: "Create a Thor text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".thor text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .thor Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate thor effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Thor Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "zodiac",
        desc: "Create a Zodiac text effect",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".zodiac text",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (!args.length) {
                    return reply("❌ Please provide a name. Example: .zodiac Empire");
                }
                const name = args.join(" ");
                const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-star-zodiac-wallpaper-mobile-604.html&name=${encodeURIComponent(name)}`;
                const result = await fetchJson(apiUrl);
                if (!result?.result?.download_url) {
                    return reply("❌ Failed to generate zodiac effect.");
                }
                await conn.sendMessage(from, {
                    image: { url: result.result.download_url },
                    caption: "🎨 Your Zodiac Text Effect"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    },
    {
        pattern: "ytlogo",
        desc: "Create a Valorant YouTube banner with three text inputs",
        category: "logo",
        react: "🎨",
        filename: __filename,
        use: ".ytlogo text1 text2 text3",
        execute: async (conn, mek, m, { from, args, reply }) => {
            try {
                if (args.length < 3) {
                    return reply("❌ Please provide 3 text inputs. Example: .ytlogo Text1 Text2 Text3");
                }
                const text1 = args[0];
                const text2 = args[1];
                const text3 = args.slice(2).join(" ");
                const apiUrl = `https://api.nexoracle.com/ephoto360/valorant-youtube-banner?apikey=MepwBcqIM0jYN0okD&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}`;
                const buffer = await getBuffer(apiUrl);
                await conn.sendMessage(from, {
                    image: buffer,
                    caption: "🎨 Your Valorant YouTube Banner"
                }, { quoted: fakevCard });
            } catch (e) {
                return reply(`❌ Error: ${e.message}`);
            }
        }
    }
];

// Credit: ARSLAN-MD OFFICIAL 
