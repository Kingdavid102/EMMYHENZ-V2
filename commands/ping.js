const os = require('os');
const settings = require('../settings.js');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    return [
        days > 0 ? `${days}d` : null,
        hours > 0 ? `${hours}h` : null,
        minutes > 0 ? `${minutes}m` : null,
        `${seconds}s`
    ].filter(Boolean).join(' ');
}

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        const pingMsg = await sock.sendMessage(chatId, { 
            text: '🏓 _𝓟𝓲𝓷𝓰𝓲𝓷𝓰..._',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: false,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317747980810@newsletter',
                    newsletterName: '🌿𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2🌿',
                    serverMessageId: -1
                }
            }
        });
        
        const end = Date.now();
        const ping = Math.round((end - start) / 2);
        const uptime = formatTime(process.uptime());

        // Send image with your bot's URL
        await sock.sendMessage(chatId, { 
            image: { 
                url: 'https://files.catbox.moe/ya83jp.jpg' // Your bot's image URL
            },
            caption: `╔═══════════◇◆◇══════════╗
       🌐 𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2 ❤️‍🔥
╠────────────────────────╣
║  🧿 *pong* ${ping.toString().padEnd(6)} ms
║  ⏳ *bot running for* :   ${uptime.padEnd(14)}
║  🛜.    *🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿*
╠────────────────────────╣
     bot-connect.emmyhenztech.space
╠────────────────────────╣
   𝐺𝑒𝑡 𝑦𝑜𝑢𝑟 𝑓𝑟𝑒𝑒 𝑤ℎ𝑎𝑡𝑠𝑎𝑝𝑝 𝑏𝑜𝑡 𝑛𝑜𝑤👆
╚═══════════◇◆◇══════════╝`,
            quoted: message,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317747980810@newsletter',
                    newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                    serverMessageId: -1
                }
            }
        });

        // Delete the initial ping message
        if (pingMsg?.key?.id) {
            setTimeout(async () => {
                try {
                    await sock.sendMessage(chatId, {
                        delete: {
                            id: pingMsg.key.id,
                            remoteJid: chatId,
                            fromMe: true
                        }
                    });
                } catch (deleteError) {
                    console.log('Could not delete ping message:', deleteError);
                }
            }, 1000);
        }

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Offline',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317747980810@newsletter',
                    newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                    serverMessageId: -1
                }
            }
        });
    }
}

module.exports = pingCommand;