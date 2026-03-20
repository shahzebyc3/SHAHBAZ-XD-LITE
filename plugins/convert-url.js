// === tools-commands.js ===
const { fetchJson } = require('../lib/functions2');
const { fakevCard } = require('../lib/fakevcard');
const axios = require('axios');

module.exports = [
  {
    pattern: 'ip',
    desc: 'Get IP address information and location',
    category: 'tools',
    react: '🌐',
    filename: __filename,
    use: '.ip address',
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        if (!args.length) {
          return reply('❌ Please provide an IP address. Example: .ip 112.90.150.204');
        }

        const ip = args[0];
        const apiUrl = `https://ipwho.is/${ip}`;
        const result = await fetchJson(apiUrl);

        if (!result?.success) {
          return reply('❌ IP not found or invalid!');
        }

        const ipInfo = `
🌐 IP Information for ${ip}
📍 Location:
   • Country: ${result.country || 'N/A'}
   • Region: ${result.region || 'N/A'}
   • City: ${result.city || 'N/A'}
   • Postal: ${result.postal || 'N/A'}
📡 Network:
   • ISP: ${result.connection?.isp || 'N/A'}
   • Org: ${result.connection?.org || 'N/A'}
   • ASN: ${result.connection?.asn || 'N/A'}
📊 Coordinates:
   • Latitude: ${result.latitude || 'N/A'}
   • Longitude: ${result.longitude || 'N/A'}
   • Timezone: ${result.timezone?.id || 'N/A'}
🔧 Technical:
   • Type: ${result.type || 'N/A'}
   • Continent: ${result.continent || 'N/A'}
   • Calling Code: ${result.calling_code || 'N/A'}
   • Currency: ${result.currency || 'N/A'}
        `.trim();

        if (result.latitude && result.longitude) {
          await conn.sendMessage(from, {
            location: { degreesLatitude: result.latitude, degreesLongitude: result.longitude },
            ephemeralExpiration: 604800
          }, { quoted: fakevCard });
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await conn.sendMessage(from, { text: ipInfo }, { quoted: fakevCard });

      } catch (e) {
        return reply(`❌ Error: ${e.message || 'Unknown error'}`);
      }
    }
  },

  {
    pattern: 'abellashort',
    desc: 'Shorten URLs using Abella shortener service',
    category: 'tools',
    react: '🔗',
    filename: __filename,
    use: '.abellashort url',
    execute: async (conn, mek, m, { from, args, reply }) => {
      try {
        const url = args.join(' ');
        if (!url) {
          return reply('🔗 Please enter the URL you want to shorten!\nExample: .abellashort https://google.com');
        }

        await conn.sendMessage(from, {
          text: 'Processing your URL...'
        }, { quoted: fakevCard });

        const response = await axios.post(
          'https://short.abella.icu/api/shorten',
          { url },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
              'Referer': 'https://short.abella.icu/'
            }
          }
        );

        const data = response.data;
        if (!data.shortUrl) {
          return reply('❌ Sorry, I could not shorten this URL');
        }

        await conn.sendMessage(from, {
          text: `
🔗 URL Shortener

Original: ${url}
Shortened: ${data.shortUrl}

Shortened using Abella service
          `.trim()
        }, { quoted: fakevCard });

      } catch (e) {
        console.error('abellashort error:', e);
        return reply('❌ Sorry! I had difficulty shortening this URL. The server might be busy or the URL is invalid.');
      }
    }
  }
];