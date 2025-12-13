const { sleep } = require('../lib/myfunc');

async function pairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "Please provide a phone number. Usage: .pair [country code][number]",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363317747980810@newsletter',
                        newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                        serverMessageId: -1
                    }
                }
            });
        }

        // Remove any non-digit characters from the number
        const cleanNumber = q.replace(/\D/g, '');
        
        // Basic validation - at least 8 digits
        if (cleanNumber.length < 8) {
            return await sock.sendMessage(chatId, {
                text: "Invalid phone number format. Please provide a valid phone number.",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363317747980810@newsletter',
                        newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                        serverMessageId: -1
                    }
                }
            });
        }

        await sock.sendMessage(chatId, {
            text: "⏳ Generating pairing code...",
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317747980810@newsletter',
                    newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                    serverMessageId: -1
                }
            }
        });

        try {
            const response = await fetch('https://bot-connect.emmyhenztech.space/request-pairing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: cleanNumber })
            });
            const data = await response.json();
            
            if (data.success) {
                const pairingCode = data.pairingCode;
                
                // Send formatted message with buttons
                const buttonMessage = {
                    text: `✅ *PAIRING CODE GENERATED*\n\n📱 *Number:* ${cleanNumber}\n🔢 *Code:* ${pairingCode}\n\n*Follow these steps:*\n1. Open WhatsApp on your phone\n2. Go to Linked Devices\n3. Tap on Link a Device\n4. Enter the 8-digit code above`,
                    buttons: [{ buttonId: 'copy', buttonText: { displayText: '📋 Copy Code' }, type: 1 }],
                    headerType: 1,
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
                
                await sock.sendMessage(chatId, buttonMessage);
                
                // Also send just the code
                await sock.sendMessage(chatId, {
                    text: pairingCode,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363317747980810@newsletter',
                            newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                            serverMessageId: -1
                        }
                    }
                });
                
                // Optional: Add audio message like in the second code
                // await sleep(2000);
                // await sock.sendMessage(chatId, { audio: kingbadboiplay, mimetype: 'audio/mpeg' });
                
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ Error: ${data.error || 'Failed to generate pairing code'}`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363317747980810@newsletter',
                            newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                            serverMessageId: -1
                        }
                    }
                });
            }
        } catch (apiError) {
            console.error('Pairing error:', apiError);
            await sock.sendMessage(chatId, {
                text: "❌ Network error. Please try again later.",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363317747980810@newsletter',
                        newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                        serverMessageId: -1
                    }
                }
            });
        }
    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, {
            text: "An error occurred. Please try again later.",
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317747980810@newsletter',
                    newsletterName: '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿',
                    serverMessageId: -1
                }
            }
        });
    }
}

module.exports = pairCommand;