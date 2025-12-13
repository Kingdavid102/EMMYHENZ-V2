const fetch = require('node-fetch');

async function lyricsCommand(sock, chatId, songTitle) {
    if (!songTitle) {
        await sock.sendMessage(chatId, { 
            text: '🔍 𝑬𝒏𝒕𝒆𝒓 𝑨 𝑺𝒐𝒏𝒈 𝑵𝒂𝒎𝒆 𝑻𝒐 𝑮𝒆𝒕 𝑻𝒉𝒆 𝒍𝒚𝒓𝒊𝒄𝒔! Usage: *lyrics <song name>*'
        });
        return;
    }

    try {
        // Fetch song lyrics using the some-random-api.com API
        const apiUrl = `https://api.lyrics.ovh/v1/=${encodeURIComponent(songTitle)}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        
        if (!json.lyrics) {
            await sock.sendMessage(chatId, { 
                text: `❌ Sorry, I couldn't find any lyrics for "${songTitle}".`
            });
            return;
        }
        
        // Sending the formatted result to the user
        await sock.sendMessage(chatId, {
            text: `🎵 *𝐒𝐎𝐍𝐆 𝐋𝐘𝐑𝐈𝐂𝐒* 🎶\n\n▢ *𝐓𝐈𝐓𝐋𝐄:* ${json.title || songTitle}\n▢ *𝐀𝐑𝐓𝐈𝐒𝐓:* ${json.author || 'Unknown'}\n\n📜 *𝐋𝐘𝐑𝐈𝐂𝐒:*\n${json.lyrics}\n\n𝐸𝑛𝑗𝑜𝑦 𝑦𝑜𝑢𝑟 𝑠𝑒𝑙𝑓! 🎧 🎶`
        });
    } catch (error) {
        console.error('Error in lyrics command:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ An error occurred while fetching the lyrics for "${songTitle}".`
        });
    }
}

module.exports = { lyricsCommand };
