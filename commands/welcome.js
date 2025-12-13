const { handleWelcome } = require('../lib/welcome');

async function welcomeCommand(sock, chatId, message, match) {
    // Check if it's a group
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: '𝑇ℎ𝑖𝑠 𝐼𝑠 𝐴 𝐺𝑟𝑜𝑢𝑝 𝐶𝑜𝑚𝑚𝑎𝑛𝑑 𝑂𝑛𝑙𝑦.' });
        return;
    }

    // Extract match from message
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');

    await handleWelcome(sock, chatId, message, matchText);
}

module.exports = welcomeCommand;
