const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// Channel info for message context
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363317747980810@newsletter',
            newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
            serverMessageId: -1
        }
    }
};

async function vv2Command(sock, chatId, message) {
    try {
        // Get bot owner JID
        const botOwnerJid = settings.botOwner.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        // Get quoted message with better error handling
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                            message.message?.imageMessage ||
                            message.message?.videoMessage;

        if (!quotedMessage) {
            await sock.sendMessage(chatId, { 
                text: '🥸 _𝑅𝑒𝑝𝑙𝑦 𝑇𝑜 𝐴 𝑉𝑖𝑒𝑤 𝑂𝑛𝑐𝑒 𝑀𝑒𝑠𝑠𝑎𝑔𝑒!_',
                ...channelInfo
            });
            return;
        }

        // Enhanced view once detection
        const isViewOnceImage = quotedMessage.imageMessage?.viewOnce === true || 
                              quotedMessage.viewOnceMessage?.message?.imageMessage ||
                              message.message?.viewOnceMessage?.message?.imageMessage;
                              
        const isViewOnceVideo = quotedMessage.videoMessage?.viewOnce === true || 
                              quotedMessage.viewOnceMessage?.message?.videoMessage ||
                              message.message?.viewOnceMessage?.message?.videoMessage;

        // Get the actual message content
        let mediaMessage;
        if (isViewOnceImage) {
            mediaMessage = quotedMessage.imageMessage || 
                         quotedMessage.viewOnceMessage?.message?.imageMessage ||
                         message.message?.viewOnceMessage?.message?.imageMessage;
        } else if (isViewOnceVideo) {
            mediaMessage = quotedMessage.videoMessage || 
                         quotedMessage.viewOnceMessage?.message?.videoMessage ||
                         message.message?.viewOnceMessage?.message?.videoMessage;
        }

        if (!mediaMessage) {
            console.log('Message structure:', JSON.stringify(message, null, 2));
            await sock.sendMessage(chatId, { 
                text: ' 🛑 Could not detect view once message! Please make sure you replied to a view once image/video.',
                ...channelInfo
            });
            return;
        }

        // Handle view once image
        if (isViewOnceImage) {
            try {
                console.log('📸 Processing view once image...');
                const stream = await downloadContentFromMessage(mediaMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const caption = mediaMessage.caption || '';
                
                // Send to bot owner instead of current chat
                await sock.sendMessage(botOwnerJid, { 
                    image: buffer,
                    caption: `*🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿*\n\n*𝐕𝐈𝐄𝐖 𝐎𝐍𝐂𝐄 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃 😎:* Image 📸\n${caption ? `*Caption:* ${caption}` : ''}`,
                    ...channelInfo
                });
                
                // Send confirmation to current chat
                await sock.sendMessage(chatId, { 
                    text: '✅ View once image forwarded to owner!',
                    ...channelInfo
                });
                
                console.log('_View once image processed successfully_');
                return;
            } catch (err) {
                console.error('🛑 Error downloading image:', err);
                await sock.sendMessage(chatId, { 
                    text: '🛑 Failed to process view once image! Error: ' + err.message,
                    ...channelInfo
                });
                return;
            }
        }

        // Handle view once video
        if (isViewOnceVideo) {
            try {
                console.log('Processing view once video...');
                
                // Create temp directory if it doesn't exist
                const tempDir = path.join(__dirname, '../temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir);
                }

                const tempFile = path.join(tempDir, `temp_${Date.now()}.mp4`);
                const stream = await downloadContentFromMessage(mediaMessage, 'video');
                const writeStream = fs.createWriteStream(tempFile);
                
                for await (const chunk of stream) {
                    writeStream.write(chunk);
                }
                writeStream.end();

                // Wait for file to be written
                await new Promise((resolve) => writeStream.on('finish', resolve));

                const caption = mediaMessage.caption || '';

                // Send to bot owner instead of current chat
                await sock.sendMessage(botOwnerJid, { 
                    video: fs.readFileSync(tempFile),
                    caption: `*🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿*\n\n*𝐕𝐈𝐄𝐖 𝐎𝐍𝐂𝐄 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃😎* Video 📹\n${caption ? `*Caption:* ${caption}` : ''}`,
                    ...channelInfo
                });

                // Send confirmation to current chat
                await sock.sendMessage(chatId, { 
                    text: '✅ View once video forwarded to owner!',
                    ...channelInfo
                });

                // Clean up temp file
                fs.unlinkSync(tempFile);
                
                console.log('View once video processed successfully');
                return;
            } catch (err) {
                console.error(' 🛑 Error processing video:', err);
                await sock.sendMessage(chatId, { 
                    text: ' 🛑 Failed to process view once video! Error: ' + err.message,
                    ...channelInfo
                });
                return;
            }
        }

        // If we get here, it wasn't a view once message
        await sock.sendMessage(chatId, { 
            text: '🛑 This is not a view once message! Please reply to a view once image/video.',
            ...channelInfo
        });

    } catch (error) {
        console.error('🛑 Error in vv2 command:', error);
        await sock.sendMessage(chatId, { 
            text: '🛑 Error processing view once message! Error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = vv2Command;