const settings = require("../settings");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

async function downloadImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const tempPath = path.join(tmpdir(), `zuko_alive_${Date.now()}.jpg`);
        await fs.promises.writeFile(tempPath, response.data);
        return tempPath;
    } catch (error) {
        console.error('Error downloading image:', error);
        return null;
    }
}

async function aliveCommand(sock, chatId) {
    try {
        const message = `
╔═══════════◇◆◇══════════╗
    🌐 🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿 ❤️‍🔥
╠────────────────────────╣
║ 🟢 *𝐒𝐭𝐚𝐭𝐮𝐬*: Online
║ ⚙️ *𝐕𝐞𝐫𝐬𝐢𝐨𝐧*: 1.0.0
║ 🌍 *𝐌𝐨𝐝𝐞*: Public
╠────────────────────────╣
║ 𝓑𝓸𝓽 𝓘𝓼 𝓡𝓮𝓪𝓭𝔂 𝓣𝓸 𝓦𝓸𝓻𝓴
╠────────────────────────╣
║💡𝐓𝐲𝐩𝐞 *.menu* 𝐭𝐨 𝐞𝐱𝐩𝐥𝐨𝐫𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬!
╚═══════════◇◆◇══════════╝
`.trim();

        const imageUrl = 'https://files.catbox.moe/ibzpii.png';
        const imagePath = await downloadImage(imageUrl);
        
        const messageOptions = {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317747980810@newsletter',
                    newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                    serverMessageId: -1
                }
            }
        };

        if (imagePath) {
            try {
                messageOptions.image = fs.readFileSync(imagePath);
                messageOptions.caption = message;
            } finally {
                // Clean up the downloaded image
                fs.unlink(imagePath, () => {});
            }
        } else {
            messageOptions.text = message;
        }

        await sock.sendMessage(chatId, messageOptions);
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { 
            text: '╔═══════◇◆◇═══════╗\n┃ ❗ 𝐄𝐑𝐑𝐎𝐑 ┃\n╚═══════◇◆◇═══════╝\nBot is active but status unavailable' 
        });
    }
}

module.exports = aliveCommand;
