const fs = require('fs');
const axios = require('axios');
const isAdmin = require('../lib/isAdmin');

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

// =================
// GROUP MANAGEMENT
// =================

async function setnameCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Bot must be an admin to change group name.',
                ...channelInfo
            });
            return;
        }

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a new group name.\n\n*Usage:* .setname New Group Name',
                ...channelInfo
            });
            return;
        }

        const newName = args.join(' ');
        await sock.groupUpdateSubject(chatId, newName);
        
        await sock.sendMessage(chatId, {
            text: `✅ Group name changed to: *${newName}*`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Failed to change group name: ' + error.message,
            ...channelInfo
        });
    }
}

async function setdescCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Bot must be an admin to change group description.',
                ...channelInfo
            });
            return;
        }

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a new group description.\n\n*Usage:* .setdesc New group description here',
                ...channelInfo
            });
            return;
        }

        const newDesc = args.join(' ');
        await sock.groupUpdateDescription(chatId, newDesc);
        
        await sock.sendMessage(chatId, {
            text: `✅ Group description updated successfully!`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Failed to change group description: ' + error.message,
            ...channelInfo
        });
    }
}

async function revokeCommand(sock, chatId, msg) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Bot must be an admin to revoke invite link.',
                ...channelInfo
            });
            return;
        }

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        await sock.groupRevokeInvite(chatId);
        
        await sock.sendMessage(chatId, {
            text: '✅ Group invite link has been revoked and reset!',
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Failed to revoke invite link: ' + error.message,
            ...channelInfo
        });
    }
}

async function hidetagCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a message to send.\n\n*Usage:* .hidetag Your message here',
                ...channelInfo
            });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants.map(p => p.id);
        const message = args.join(' ');

        await sock.sendMessage(chatId, {
            text: message,
            mentions: participants,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Failed to send hidetag message: ' + error.message,
            ...channelInfo
        });
    }
}

async function tagadminsCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

        if (admins.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ No admins found in this group.',
                ...channelInfo
            });
            return;
        }

        const message = args.length > 0 ? args.join(' ') : 'Admin attention required!';
        const adminMentions = admins.map(admin => admin.id);
        
        let tagText = `📢 *ADMIN ALERT*\n\n${message}\n\n*Admins:*\n`;
        admins.forEach((admin, index) => {
            tagText += `${index + 1}. @${admin.id.split('@')[0]}\n`;
        });

        await sock.sendMessage(chatId, {
            text: tagText,
            mentions: adminMentions,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Failed to tag admins: ' + error.message,
            ...channelInfo
        });
    }
}

// =================
// UTILITY COMMANDS
// =================

async function screenshotCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a URL to screenshot.\n\n*Usage:* .screenshot https://google.com',
                ...channelInfo
            });
            return;
        }

        const url = args[0];
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a valid URL starting with http:// or https://',
                ...channelInfo
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '📸 Taking screenshot, please wait...',
            ...channelInfo
        });

        try {
            const screenshotUrl = `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(url)}&dimension=1024x768`;
            
            const response = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `📸 *Screenshot*\n\nURL: ${url}\nTime: ${new Date().toLocaleString()}`,
                ...channelInfo
            });

        } catch (apiError) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to take screenshot. Please try again with a different URL.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Screenshot error: ' + error.message,
            ...channelInfo
        });
    }
}

async function qrcodeCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide text to generate QR code.\n\n*Usage:* .qrcode Your text here',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        
        await sock.sendMessage(chatId, {
            text: '🔲 Generating QR code...',
            ...channelInfo
        });

        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
            
            const response = await axios.get(qrUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🔲 *QR Code Generated*\n\nText: ${text}\nScan to view content`,
                ...channelInfo
            });

        } catch (apiError) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to generate QR code. Please try again.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ QR code error: ' + error.message,
            ...channelInfo
        });
    }
}

async function shorturlCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a URL to shorten.\n\n*Usage:* .shorturl https://google.com',
                ...channelInfo
            });
            return;
        }

        const url = args[0];
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a valid URL starting with http:// or https://',
                ...channelInfo
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '🔗 Shortening URL...',
            ...channelInfo
        });

        try {
            const shortUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;
            const response = await axios.get(shortUrl);
            
            if (response.data && !response.data.includes('Error')) {
                await sock.sendMessage(chatId, {
                    text: `🔗 *URL Shortened Successfully*\n\n*Original:* ${url}\n\n*Shortened:* ${response.data}`,
                    ...channelInfo
                });
            } else {
                throw new Error('Invalid URL or API error');
            }

        } catch (apiError) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to shorten URL. Please check the URL and try again.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ URL shortener error: ' + error.message,
            ...channelInfo
        });
    }
}

async function translateCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '❌ Usage: .translate [language] [text]\n\n*Examples:*\n.translate es Hello world\n.translate fr Good morning\n.translate de Thank you\n\n*Common codes:* es=Spanish, fr=French, de=German, it=Italian, pt=Portuguese, ru=Russian, ja=Japanese, ko=Korean, zh=Chinese',
                ...channelInfo
            });
            return;
        }

        const targetLang = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        await sock.sendMessage(chatId, {
            text: '🌐 Translating...',
            ...channelInfo
        });

        try {
            const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`;
            const response = await axios.get(translateUrl);
            
            if (response.data && response.data.responseData) {
                const translatedText = response.data.responseData.translatedText;
                const detectedLang = response.data.responseData.match || 'auto';
                
                await sock.sendMessage(chatId, {
                    text: `🌐 *Translation Result*\n\n*Original:* ${text}\n*Translated:* ${translatedText}\n*To Language:* ${targetLang.toUpperCase()}`,
                    ...channelInfo
                });
            } else {
                throw new Error('Translation failed');
            }

        } catch (apiError) {
            await sock.sendMessage(chatId, {
                text: '❌ Translation failed. Please check the language code and try again.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Translation error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    // Group Management
    setnameCommand,
    setdescCommand,
    revokeCommand,
    hidetagCommand,
    tagadminsCommand,
    
    // Utility Commands
    screenshotCommand,
    qrcodeCommand,
    shorturlCommand,
    translateCommand
};