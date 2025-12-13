const moment = require('moment-timezone');

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

async function creategcCommand(sock, chatId, msg, args) {
    try {
        // Check if sender is owner
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ 𝐓𝐡𝐢𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐂𝐚𝐧 𝐁𝐞 𝐔𝐬𝐞𝐝 𝐎𝐧𝐥𝐲 𝐁𝐲 𝐌𝐲 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!',
                ...channelInfo
            });
            return;
        }

        // Get group name from arguments
        const groupName = args.join(" ").trim();

        if (!groupName) {
            await sock.sendMessage(chatId, { 
                text: '❌ Please provide a group name!\n\n*Usage:* .creategc groupname\n*Example:* .creategc My Awesome Group',
                ...channelInfo
            });
            return;
        }

        try {
            // Create the group
            const cret = await sock.groupCreate(groupName, []);
            
            // Get the invite code
            const response = await sock.groupInviteCode(cret.id);
            
            // Format the creation time
            const creationTime = moment(cret.creation * 1000)
                .tz("Africa/Lagos")
                .format("DD/MM/YYYY HH:mm:ss");
            
            // Create response message
            const teks = `     「 *Create Group* 」

▸ *Name* : ${cret.subject}
▸ *Owner* : @${cret.owner.split("@")[0]}
▸ *Creation* : ${creationTime}

*Group Link:*
https://chat.whatsapp.com/${response}
       `;

            // Send the response with mentions
            await sock.sendMessage(chatId, { 
                text: teks, 
                mentions: [cret.owner],
                ...channelInfo
            }, { 
                quoted: msg 
            });

        } catch (createError) {
            console.error('Group creation error:', createError);
            await sock.sendMessage(chatId, {
                text: '❌ Error creating group!\n\nPossible reasons:\n- Group name contains invalid characters\n- Network connection issues\n- WhatsApp API limitations\n\nPlease try again with a different group name.',
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in creategc command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred while creating the group!\n' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    creategcCommand
};