const { malvin } = require('../malvin');
const axios = require('axios');
const { fakevCard } = require('../lib/fakevCard');
const { getPrefix } = require('../lib/prefix');
const prefix = getPrefix();

malvin({
    pattern: "abellashort",
    alias: ['shortabella', 'abellaurl'],
    react: '🔗',
    desc: "Shorten URLs using Abella shortener service",
    category: "tools",
    filename: __filename
}, async (malvin, mek, m, { from, args }) => {
    const text = args[0];
    
    if (!text) {
        return malvin.sendMessage(from, {
            text: `🔗 Please enter the URL you want to shorten!\nExample: *${prefix}abellashort* https://google.com`
        }, { quoted: fakevCard });
    }

    try {
        malvin.sendMessage(from, {
            text: 'Processing your URL...'
        }, { quoted: fakevCard });

        const { data } = await axios.post(
            'https://short.abella.icu/api/shorten',
            { url: text },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
                    'Referer': 'https://short.abella.icu/'
                }
            }
        );

        if (!data.shortUrl) {
            return malvin.sendMessage(from, {
                text: '❌ Sorry, I could not shorten this URL'
            }, { quoted: fakevCard });
        }

        malvin.sendMessage(from, {
            text: `🔗 *URL Shortener*\n\n• *Original:* ${text}\n• *Shortened:* ${data.shortUrl}\n\n_Shortened using Abella service_`
        }, { quoted: fakevCard });

    } catch (e) {
        console.error(e);
        malvin.sendMessage(from, {
            text: '❌ Sorry! I had difficulty shortening this URL. The server might be busy or the URL is invalid.'
        }, { quoted: fakevCard });
    }
});