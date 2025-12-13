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

// Path to store anti-call configuration
const configPath = path.join(__dirname, '../data/anticall.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
}

async function anticallCommand(sock, chatId, msg, args) {
    try {
        // Check if sender is owner
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ 𝐓𝐡𝐢𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐂𝐚𝐧 𝐁𝐞 𝐔𝐬𝐞𝐝 𝐎𝐧𝐥𝐲 𝐁𝐲 𝐌𝐲 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!',
                ...channelInfo
            });
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show usage
        if (!args || args.length === 0) {
            const status = config.enabled ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, { 
                text: `📵 *𝐀𝐍𝐓𝐈-𝐂𝐀𝐋𝐋 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n\nCurrent status: ${status}\n\nPlease choose an option to enable or disable anticall.\n\n*Usage:*\n- .anticall on  : Enable Anti-Call\n- .anticall off : Disable Anti-Call\n\n*Example:* .anticall on`,
                ...channelInfo
            });
            return;
        }

        // Handle on/off commands
        const command = args[0].toLowerCase();
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '✅ *anticall is enabled*\n\nBot will now automatically reject incoming calls.',
                ...channelInfo
            });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '❌ *anticall is disabled*\n\nBot will no longer automatically reject calls.',
                ...channelInfo
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `❌ Invalid option!\n\nPlease choose an option to enable or disable anticall.\n\n*Usage:*\n- .anticall on  : Enable Anti-Call\n- .anticall off : Disable Anti-Call\n\n*Example:* .anticall on`,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in anticall command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while managing anti-call settings!\n' + error.message,
            ...channelInfo
        });
    }
}

// Function to check if anti-call is enabled
function isAnticallEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error checking anticall config:', error);
        return false;
    }
}

// Function to handle incoming calls
async function handleIncomingCall(sock, callUpdate) {
    try {
        if (!isAnticallEnabled()) {
            return;
        }

        if (callUpdate.status === 'offer') {
            const callId = callUpdate.id;
            const from = callUpdate.from;
            
            // Reject the call
            await sock.rejectCall(callId, from);
            
            // Send message to the caller
            await sock.sendMessage(from, {
                text: '📵 *𝐀𝐍𝐓𝐈-𝐂𝐀𝐋𝐋 𝐀𝐂𝐓𝐈𝐕𝐄*\n\nSorry, this bot does not accept calls. Please send a text message instead.',
                ...channelInfo
            });
            
            console.log(`📵 Rejected call from: ${from.split('@')[0]}`);
        }

    } catch (error) {
        console.error('❌ Error in anti-call handler:', error.message);
    }
}

module.exports = {
    anticallCommand,
    handleIncomingCall,
    isAnticallEnabled
};