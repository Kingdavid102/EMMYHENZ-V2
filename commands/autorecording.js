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

// Path to store auto recording configuration
const configPath = path.join(__dirname, '../data/autorecording.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
}

async function autorecordingCommand(sock, chatId, msg, args) {
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

        // Get action from arguments
        const action = args.join(' ').toLowerCase();

        // If no arguments, show usage
        if (!action) {
            const status = config.enabled ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, { 
                text: `🎤 *𝐀𝐔𝐓𝐎-𝐑𝐄𝐂𝐎𝐑𝐃𝐈𝐍𝐆 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n\nCurrent status: ${status}\n\n*Usage:* .autorecording on | off\n\n*Example:* .autorecording on`,
                ...channelInfo
            });
            return;
        }

        let responseText;

        // Handle on/off commands
        if (action === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            responseText = '✅ *Auto-recording is now enabled*\n\nBot will automatically show recording indicator when processing voice messages.';
        } else if (action === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            responseText = '❌ *Auto-recording is now disabled*\n\nBot will no longer show recording indicator automatically.';
        } else {
            responseText = `❌ Invalid option!\n\n*Usage:* .autorecording on | off\n\n*Example:* .autorecording on`;
        }

        await sock.sendMessage(chatId, { 
            text: responseText,
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in autorecording command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while managing auto-recording settings!\n' + error.message,
            ...channelInfo
        });
    }
}

// Function to check if auto recording is enabled
function isAutoRecordingEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error checking autorecording config:', error);
        return false;
    }
}

// Function to handle auto recording when processing messages
async function handleAutoRecording(sock, chatId) {
    try {
        if (!isAutoRecordingEnabled()) {
            return;
        }

        // Send recording indicator
        await sock.sendPresenceUpdate('recording', chatId);
        
        // Optional: Stop recording after a short delay
        setTimeout(async () => {
            try {
                await sock.sendPresenceUpdate('available', chatId);
            } catch (err) {
                // Ignore errors when stopping recording
            }
        }, 1500 + Math.random() * 2500); // 1.5-4 seconds

    } catch (error) {
        console.error('❌ Error in auto recording handler:', error.message);
    }
}

module.exports = {
    autorecordingCommand,
    handleAutoRecording,
    isAutoRecordingEnabled
};