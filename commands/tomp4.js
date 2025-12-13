const fs = require('fs');
const { webp2mp4File } = require('../lib/uploader');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363317747980810@newsletter',
            newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
            serverMessageId: -1
        }
    }
};

async function tomp4Command(sock, chatId, msg) {
    try {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ Reply to a sticker to convert it to video!',
                ...channelInfo
            });
            return;
        }

        if (!quotedMessage.stickerMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ Reply to a sticker with caption *.tomp4* or *.tovideo*',
                ...channelInfo
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '⏳ Converting sticker to video, please wait...',
            ...channelInfo
        });

        // Create a proper message object for downloading
        const messageToDownload = {
            key: {
                remoteJid: chatId,
                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                participant: msg.message.extendedTextMessage.contextInfo.participant
            },
            message: quotedMessage,
            mtype: 'stickerMessage',
            msg: quotedMessage.stickerMessage
        };

        const media = await sock.downloadAndSaveMediaMessage(messageToDownload);
        const webpToMp4 = await webp2mp4File(media);
        
        await sock.sendMessage(chatId, {
            video: { url: webpToMp4.result },
            caption: '✅ *Sticker converted to video successfully!*\n\n📹 Convert Webp To Video',
            ...channelInfo
        }, { quoted: msg });

        // Clean up
        if (fs.existsSync(media)) {
            fs.unlinkSync(media);
        }

    } catch (error) {
        console.error('Error in tomp4 command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to convert sticker to video. Please try again with a different sticker.\n\nError: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = { tomp4Command };