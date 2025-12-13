const axios = require('axios');
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

// Path to premium users file
const premiumPath = path.join(__dirname, '../data/premium.json');

// Function to check if user is premium
function isPremium(userId) {
    try {
        if (!fs.existsSync(premiumPath)) {
            // Create empty premium file if it doesn't exist
            fs.writeFileSync(premiumPath, JSON.stringify([]));
            return false;
        }
        
        const premiumUsers = JSON.parse(fs.readFileSync(premiumPath));
        const userNumber = userId.split('@')[0];
        return premiumUsers.includes(userNumber);
    } catch (error) {
        console.error('Error checking premium status:', error);
        return false;
    }
}

async function channelreactCommand(sock, chatId, msg, args) {
    try {
        // Get sender ID
        const senderId = msg.key.participant || msg.key.remoteJid;
        
        // Check if user is premium or owner
        if (!isPremium(senderId) && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Sorry, only premium users can use this command',
                ...channelInfo
            });
            return;
        }

        // Check if enough arguments are provided
        if (!args || args.length < 4) {
            await sock.sendMessage(chatId, { 
                text: '*Usage:*\n.chreact ❤️ 😂 😊 https://whatsapp.com/channel/abcd\n\n*Format:*\n.chreact [emoji1] [emoji2] [emoji3] [channel-link]\n\n*Example:*\n.chreact 💯 🔥 👍 https://whatsapp.com/channel/0029VbArJKqJf05kN32opJ2l',
                ...channelInfo
            });
            return;
        }

        // Extract emojis and link
        const emoji1 = args[0];
        const emoji2 = args[1]; 
        const emoji3 = args[2];
        const link = args[3];

        // Validate WhatsApp channel link
        if (!link.startsWith("https://whatsapp.com/channel/")) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid channel link!\n\nPlease use a valid WhatsApp channel link format:\nhttps://whatsapp.com/channel/[channel-id]',
                ...channelInfo
            });
            return;
        }

        try {
            await sock.sendMessage(chatId, {
                text: `🔄 Starting channel Auto react process...\n\nEmojis: ${emoji1} ${emoji2} ${emoji3}\nTarget: ${link}`,
                ...channelInfo
            });

            // Construct API URL with the user-specified emojis
            const apiUrl = `https://ab-whatsapp-react.vercel.app/api/autolike?key=ab-badboi-0mzxpd&url=${encodeURIComponent(link)}&react1=${encodeURIComponent(emoji1)}&react2=${encodeURIComponent(emoji2)}&react3=${encodeURIComponent(emoji3)}`;
            
            // Make API request
            try {
                const response = await axios.get(apiUrl);
                const data = response.data;
                
                if (data.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ channel Auto react process completed by EMMYHENZ V1!\n\nReactions sent: ${emoji1} ${emoji2} ${emoji3}\nTarget: Channel post`,
                        ...channelInfo
                    });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `❌ API Error: ${data.error || 'Unknown error'}\n\nPlease try again with different emojis or check the channel link.`,
                        ...channelInfo
                    });
                }
            } catch (axiosError) {
                console.error('API request error:', axiosError);
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to connect to react API. Please try again later.\n\nError: ' + axiosError.message,
                    ...channelInfo
                });
            }
            
        } catch (apiError) {
            console.error('Channelreact API error:', apiError);
            await sock.sendMessage(chatId, {
                text: '❌ Error in channel Auto react process. Please try again later.\n\nError: ' + apiError.message,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in channelreact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred while processing channel react!\n' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    channelreactCommand
};