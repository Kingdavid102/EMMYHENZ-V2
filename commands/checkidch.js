// commands/checkidch.js

module.exports = {
    name: 'checkidch',
    alias: ['idch'],
    category: 'general',
    desc: 'Check WhatsApp channel details from a link',
    async exec(sock, message, args) {
        try {
            const chatId = message.key.remoteJid;
            const userMessage = args.join(' ');

            // Check if user is banned (assuming you have an isBanned function)
            // Replace with your actual ban check logic
            const isBanned = false; // Placeholder; integrate your ban check here
            if (isBanned) {
                return sock.sendMessage(chatId, {
                    text: '🚫 RECENTLY BANNED FROM ACCESSING THIS BOT'
                }, { quoted: message });
            }

            // Check if a link is provided
            if (!userMessage) {
                return sock.sendMessage(chatId, {
                    text: '❌ Please provide a WhatsApp channel link.\n\nUsage: `.checkidch <channel_link>`\nExample: `.checkidch https://whatsapp.com/channel/0029Va9tV...`'
                }, { quoted: message });
            }

            // Validate the link
            if (!userMessage.includes('https://whatsapp.com/channel/')) {
                return sock.sendMessage(chatId, {
                    text: '❌ Link is not valid. Please provide a valid WhatsApp channel link.'
                }, { quoted: message });
            }

            // Extract channel ID from the link
            const channelId = userMessage.split('https://whatsapp.com/channel/')[1];

            // Call the newsletterMetadata function (assuming devtrust is available)
            const res = await devtrust.newsletterMetadata('invite', channelId);

            // Format the response
            const teks = `
*ID:* ${res.id}
*Name:* ${res.name}
*Followers:* ${res.subscribers}
*Status:* ${res.state}
*Verified:* ${res.verification === 'VERIFIED' ? 'Verified' : 'No'}
            `;

            // Send the response
            await sock.sendMessage(chatId, {
                text: teks.trim()
            }, { quoted: message });

        } catch (error) {
            console.error('CheckIDCH Error:', error.message);
            let errorMessage = '❌ Failed to fetch channel details.';

            // Custom error handling
            if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
                errorMessage = '🌐 Network error. Please check your connection.';
            } else if (error.response?.status === 400) {
                errorMessage = '❌ Invalid channel link or ID.';
            } else if (error.response?.status === 429) {
                errorMessage = '⏰ Rate limit exceeded. Please try again later.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = '⏰ Request timeout. Please try again.';
            }

            await sock.sendMessage(chatId, {
                text: errorMessage
            }, { quoted: message });
        }
    }
};