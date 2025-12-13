const fs = require('fs');
const path = require('path');

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

// Path to store blocked users list
const blockedUsersPath = path.join(__dirname, '../data/blockedUsers.json');

// Initialize blocked users file if it doesn't exist
if (!fs.existsSync(blockedUsersPath)) {
    fs.writeFileSync(blockedUsersPath, JSON.stringify({ blockedUsers: [] }));
}

async function blockCommand(sock, chatId, msg, args) {
    try {
        // Check if sender is owner
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ 𝐓𝐡𝐢𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐂𝐚𝐧 𝐁𝐞 𝐔𝐬𝐞𝐝 𝐎𝐧𝐥𝐲 𝐁𝐲 𝐌𝐲 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!',
                ...channelInfo
            });
            return;
        }

        // Get user to block
        let users;
        
        // Check for mentioned user
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJid && mentionedJid[0]) {
            users = mentionedJid[0];
        }
        // Check for quoted message
        else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            users = msg.message.extendedTextMessage.contextInfo.participant;
        }
        // Check for text input (phone number)
        else if (args.length > 0) {
            const text = args.join(' ');
            users = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }
        else {
            await sock.sendMessage(chatId, {
                text: '❌ Please specify a user to block!\n\n*Usage:*\n- Reply to a message\n- Mention a user: @user\n- Use phone number: .block 1234567890',
                ...channelInfo
            });
            return;
        }

        try {
            // Block the user
            await sock.updateBlockStatus(users, 'block');

            // Add to blocked users list
            let blockedData = JSON.parse(fs.readFileSync(blockedUsersPath));
            if (!blockedData.blockedUsers.includes(users)) {
                blockedData.blockedUsers.push(users);
                fs.writeFileSync(blockedUsersPath, JSON.stringify(blockedData, null, 2));
            }

            // Get user number for display
            const userNumber = users.split('@')[0];
            
            await sock.sendMessage(chatId, {
                text: `✅ *User Blocked Successfully*\n\nUser: +${userNumber}\nStatus: Blocked`,
                ...channelInfo
            });

        } catch (blockError) {
            console.error('Error blocking user:', blockError);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to block user. Please try again.\n\nError: ' + blockError.message,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in block command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while blocking user!\n' + error.message,
            ...channelInfo
        });
    }
}

async function unblockCommand(sock, chatId, msg, args) {
    try {
        // Check if sender is owner
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ 𝐓𝐡𝐢𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐂𝐚𝐧 𝐁𝐞 𝐔𝐬𝐞𝐝 𝐎𝐧𝐥𝐲 𝐁𝐲 𝐌𝐲 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!',
                ...channelInfo
            });
            return;
        }

        // Get user to unblock
        let users;
        
        // Check for mentioned user
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJid && mentionedJid[0]) {
            users = mentionedJid[0];
        }
        // Check for quoted message
        else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            users = msg.message.extendedTextMessage.contextInfo.participant;
        }
        // Check for text input (phone number)
        else if (args.length > 0) {
            const text = args.join(' ');
            users = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }
        else {
            await sock.sendMessage(chatId, {
                text: '❌ Please specify a user to unblock!\n\n*Usage:*\n- Reply to a message\n- Mention a user: @user\n- Use phone number: .unblock 1234567890',
                ...channelInfo
            });
            return;
        }

        try {
            // Unblock the user
            await sock.updateBlockStatus(users, 'unblock');

            // Remove from blocked users list
            let blockedData = JSON.parse(fs.readFileSync(blockedUsersPath));
            blockedData.blockedUsers = blockedData.blockedUsers.filter(user => user !== users);
            fs.writeFileSync(blockedUsersPath, JSON.stringify(blockedData, null, 2));

            // Get user number for display
            const userNumber = users.split('@')[0];
            
            await sock.sendMessage(chatId, {
                text: `✅ *User Unblocked Successfully*\n\nUser: +${userNumber}\nStatus: Unblocked`,
                ...channelInfo
            });

        } catch (unblockError) {
            console.error('Error unblocking user:', unblockError);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to unblock user. Please try again.\n\nError: ' + unblockError.message,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in unblock command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while unblocking user!\n' + error.message,
            ...channelInfo
        });
    }
}

// Function to get blocked users list
function getBlockedUsers() {
    try {
        const blockedData = JSON.parse(fs.readFileSync(blockedUsersPath));
        return blockedData.blockedUsers || [];
    } catch (error) {
        console.error('Error reading blocked users:', error);
        return [];
    }
}

// Function to check if user is blocked
function isUserBlocked(userJid) {
    try {
        const blockedUsers = getBlockedUsers();
        return blockedUsers.includes(userJid);
    } catch (error) {
        console.error('Error checking blocked status:', error);
        return false;
    }
}

module.exports = {
    blockCommand,
    unblockCommand,
    getBlockedUsers,
    isUserBlocked
};