const { delay } = require('@whiskeysockets/baileys');

let activeStatus = {
    typing: new Map(),
    recording: new Map()
};

async function statusCommand(sock, chatId, args, message) {
    const action = args[0]?.toLowerCase();
    const sender = message.key.participant || message.key.remoteJid;

    try {
        switch(action) {
            case 'typing':
                activeStatus.typing.set(chatId, true);
                await sendRepeatedPresence(sock, chatId, 'composing');
                await sock.sendMessage(chatId, { 
                    text: 'Typing status activated!',
                    mentions: [sender]
                }, { quoted: message });
                break;
                
            case 'recording':
                activeStatus.recording.set(chatId, true);
                await sendRepeatedPresence(sock, chatId, 'recording');
                await sock.sendMessage(chatId, { 
                    text: 'Recording status activated!',
                    mentions: [sender]
                }, { quoted: message });
                break;
                
            case 'stop':
                activeStatus.typing.delete(chatId);
                activeStatus.recording.delete(chatId);
                await sock.sendPresenceUpdate('paused', chatId);
                await sock.sendMessage(chatId, { 
                    text: 'Status indicators disabled!',
                    mentions: [sender]
                }, { quoted: message });
                break;
                
            default:
                const helpText = [
                    '⚡ Status Command Usage:',
                    `• ${prefix}status typing - Show typing indicator`,
                    `• ${prefix}status recording - Show recording indicator`,
                    `• ${prefix}status stop - Disable all indicators`
                ].join('\n');
                await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
        }
    } catch (error) {
        console.error('Status command error:', error);
        await sock.sendMessage(chatId, { 
            text: 'Failed to update status!',
            mentions: [sender]
        }, { quoted: message });
    }
}

async function sendRepeatedPresence(sock, chatId, type) {
    const statusMap = type === 'composing' ? activeStatus.typing : activeStatus.recording;
    
    while (statusMap.get(chatId)) {
        await sock.sendPresenceUpdate(type, chatId);
        await delay(2000); // Refresh every 2 seconds
    }
    await sock.sendPresenceUpdate('paused', chatId);
}

module.exports = statusCommand;
