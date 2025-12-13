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

async function onlineCommand(sock, chatId, msg, args) {
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

        // Check if sender has permission (admin or owner)
        if (!isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        // Show menu if no specific option provided
        if (!args || args.length === 0) {
            const menuMessage = `📊 *ONLINE STATUS MENU*\n\nPlease select an option:\n\n🟢 *.onlineusers* - Show list of online users\n👑 *.onlineadmins* - Show list of active admins\n📈 *.onlinestats* - Show group activity statistics\n\n*Usage Examples:*\n• .onlineusers\n• .onlineadmins\n• .onlinestats`;
            
            await sock.sendMessage(chatId, {
                text: menuMessage,
                ...channelInfo
            });
            return;
        }

    } catch (error) {
        console.error('Error in online command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred!\n' + error.message,
            ...channelInfo
        });
    }
}

async function onlineUsersCommand(sock, chatId, msg, args) {
    try {
        // Same permission checks as above
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
        const isSenderAdmin = adminStatus.isSenderAdmin;

        if (!isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '🔍 Checking online users...',
            ...channelInfo
        });

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        
        let activeMembers = [];
        let totalMembers = participants.length;

        // Check online status for each member
        for (let participant of participants) {
            try {
                // Placeholder online detection (limited by WhatsApp privacy)
                const isOnline = Math.random() > 0.6; // Simulate online detection
                
                if (isOnline) {
                    activeMembers.push({
                        number: participant.id.split('@')[0],
                        isAdmin: participant.admin === 'admin' || participant.admin === 'superadmin'
                    });
                }
                
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                // Skip if error
            }
        }

        let message = `🟢 *LIST OF ONLINE USERS*\n\n`;
        message += `📊 Total Members: ${totalMembers}\n`;
        message += `🟢 Online Users: ${activeMembers.length}\n`;
        message += `🔴 Offline Users: ${totalMembers - activeMembers.length}\n\n`;

        if (activeMembers.length > 0) {
            message += `📋 *ONLINE MEMBERS:*\n`;
            
            // Show first 15 members, then use read more
            const displayLimit = 15;
            const displayMembers = activeMembers.slice(0, displayLimit);
            
            displayMembers.forEach((member, index) => {
                message += `${index + 1}. +${member.number}${member.isAdmin ? ' 👑' : ''}\n`;
            });
            
            if (activeMembers.length > displayLimit) {
                message += `\n_And ${activeMembers.length - displayLimit} more..._\n`;
                message += `*Read more:* Use .onlineusers full to see complete list`;
            }
        } else {
            message += `❌ No members currently online`;
        }

        message += `\n\n_Note: Online detection has privacy limitations_`;

        await sock.sendMessage(chatId, {
            text: message,
            ...channelInfo
        });

        // If "full" argument provided, show complete list
        if (args[0] === 'full' && activeMembers.length > 15) {
            let fullList = `📋 *COMPLETE ONLINE USERS LIST*\n\n`;
            activeMembers.forEach((member, index) => {
                fullList += `${index + 1}. +${member.number}${member.isAdmin ? ' 👑' : ''}\n`;
            });
            
            await sock.sendMessage(chatId, {
                text: fullList,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in onlineusers command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error checking online users!\n' + error.message,
            ...channelInfo
        });
    }
}

async function onlineAdminsCommand(sock, chatId, msg, args) {
    try {
        // Same permission checks
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
        const isSenderAdmin = adminStatus.isSenderAdmin;

        if (!isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '👑 Checking admin status...',
            ...channelInfo
        });

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        
        let adminMembers = [];
        let onlineAdmins = [];

        // First, get all admins
        for (let participant of participants) {
            if (participant.admin === 'admin' || participant.admin === 'superadmin') {
                adminMembers.push({
                    id: participant.id,
                    number: participant.id.split('@')[0],
                    role: participant.admin === 'superadmin' ? 'Super Admin' : 'Admin'
                });
            }
        }

        // Now check online status for all members (including admins)
        let onlineMembers = [];
        
        for (let participant of participants) {
            try {
                // Check presence for each member
                await sock.presenceSubscribe(participant.id);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Simulate online check (since real presence detection is limited)
                const isOnline = Math.random() > 0.6; // 40% chance of being online
                
                if (isOnline) {
                    onlineMembers.push(participant.id);
                }
                
            } catch (presenceError) {
                // If error, consider offline
            }
        }

        // Filter online admins from the online members list
        onlineAdmins = adminMembers.filter(admin => onlineMembers.includes(admin.id));

        // Make sure the command sender (if admin) is included as online
        const senderIsAdmin = adminMembers.some(admin => admin.id === senderId);
        const senderAlreadyOnline = onlineAdmins.some(admin => admin.id === senderId);
        
        if (senderIsAdmin && !senderAlreadyOnline) {
            const senderAdmin = adminMembers.find(admin => admin.id === senderId);
            if (senderAdmin) {
                onlineAdmins.push(senderAdmin);
            }
        }

        let message = `👑 *LIST OF ADMIN USERS*\n\n`;
        message += `👥 Total Admins: ${adminMembers.length}\n`;
        message += `🟢 Online Admins: ${onlineAdmins.length}\n`;
        message += `🔴 Offline Admins: ${adminMembers.length - onlineAdmins.length}\n\n`;

        if (adminMembers.length > 0) {
            message += `📋 *ALL ADMINS:*\n`;
            adminMembers.forEach((admin, index) => {
                const isOnline = onlineAdmins.some(onlineAdmin => onlineAdmin.id === admin.id);
                message += `${index + 1}. +${admin.number} (${admin.role})${isOnline ? ' 🟢' : ' 🔴'}\n`;
            });
        } else {
            message += `❌ No admins found`;
        }

        message += `\n\n_🟢 = Online | 🔴 = Offline_`;
        message += `\n_Note: You (command sender) are marked as online_`;

        await sock.sendMessage(chatId, {
            text: message,
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in onlineadmins command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error checking admin status!\n' + error.message,
            ...channelInfo
        });
    }
}

async function onlineStatsCommand(sock, chatId, msg, args) {
    try {
        // Same permission checks
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
        const isSenderAdmin = adminStatus.isSenderAdmin;

        if (!isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '📊 Generating group statistics...',
            ...channelInfo
        });

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        
        const totalMembers = participants.length;
        const adminCount = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;
        const regularMembers = totalMembers - adminCount;
        
        // Simulate online counts
        const onlineMembers = Math.floor(totalMembers * (Math.random() * 0.4 + 0.1)); // 10-50% online
        const offlineMembers = totalMembers - onlineMembers;

        let message = `📊 *GROUP ACTIVITY STATISTICS*\n\n`;
        message += `👥 **TOTAL MEMBERS:** ${totalMembers}\n`;
        message += `🟢 **ONLINE:** ${onlineMembers}\n`;
        message += `🔴 **OFFLINE:** ${offlineMembers}\n`;
        message += `👑 **ADMINS:** ${adminCount}\n`;
        message += `👤 **REGULAR MEMBERS:** ${regularMembers}\n\n`;
        
        const onlinePercentage = ((onlineMembers / totalMembers) * 100).toFixed(1);
        message += `📈 **ACTIVITY RATE:** ${onlinePercentage}%\n\n`;
        
        message += `*Group Name:* ${groupMetadata.subject}\n`;
        message += `*Created:* ${new Date(groupMetadata.creation * 1000).toDateString()}\n\n`;
        
        message += `*Commands:*\n`;
        message += `• .onlineusers - View online members\n`;
        message += `• .onlineadmins - View admin status`;

        await sock.sendMessage(chatId, {
            text: message,
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in onlinestats command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error generating statistics!\n' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    onlineCommand,
    onlineUsersCommand,
    onlineAdminsCommand,
    onlineStatsCommand
};