const fs = require('fs');
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

async function kickallCommand(sock, chatId, msg, args) {
    try {
        // Check if it's a group
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        // Get sender ID
        const senderId = msg.key.participant || msg.key.remoteJid;

        // Check admin permissions
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);
        const isSenderAdmin = adminStatus.isSenderAdmin;
        const isBotAdmin = adminStatus.isBotAdmin;

        // Check if bot is admin
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ 🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿 must be an admin to use this command.',
                ...channelInfo
            });
            return;
        }

        // Check if sender has permission (admin or owner)
        if (!isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins or bot owner can use this command.',
                ...channelInfo
            });
            return;
        }

        try {
            // Get group metadata to get participants
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            
            if (!participants || participants.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '❌ Unable to fetch group participants.',
                    ...channelInfo
                });
                return;
            }

            // Filter out admins and the bot itself from being kicked
            const membersToKick = participants
                .filter(participant => {
                    // Don't kick admins
                    if (participant.admin === 'admin' || participant.admin === 'superadmin') {
                        return false;
                    }
                    // Don't kick the bot itself
                    if (participant.id === sock.user.id) {
                        return false;
                    }
                    // Don't kick the command sender
                    if (participant.id === senderId) {
                        return false;
                    }
                    return true;
                })
                .map(participant => participant.id);

            if (membersToKick.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '❌ No members to kick! Only admins remain in the group.',
                    ...channelInfo
                });
                return;
            }

            // Send confirmation message
            await sock.sendMessage(chatId, {
                text: `⚠️ *KICK ALL MEMBERS*\n\nKicking ${membersToKick.length} members from the group...\n\n_Admins will not be kicked._`,
                ...channelInfo
            });

            // Kick all non-admin members
            await sock.groupParticipantsUpdate(chatId, membersToKick, 'remove');

            // Send completion message
            await sock.sendMessage(chatId, {
                text: `✅ *Done!*\n\nSuccessfully kicked ${membersToKick.length} members from the group.\n\n_Admins were preserved._`,
                ...channelInfo
            });

        } catch (kickError) {
            console.error('Error kicking members:', kickError);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to kick some members. Make sure the bot has proper admin permissions.\n\nError: ' + kickError.message,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in kickall command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred while kicking members!\n' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    kickallCommand
};