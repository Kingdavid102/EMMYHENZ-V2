const fs = require('fs').promises;
const path = require('path');

module.exports = {
  name: 'autobio',
  alias: ['bio'],
  category: 'general',
  desc: 'Set or update the WhatsApp bio',
  async exec(sock, message, args) {
    try {
      const chatId = message.key.remoteJid;
      const dataPath = path.join(__dirname, '../data/autobio.json');
      const defaultBio = '🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿 𝐢𝐬 𝐚𝐜𝐭𝐢𝐯𝐞';
      const newBio = args.join(' ') || defaultBio;

      await sock.updateProfileStatus(newBio);
      await fs.writeFile(dataPath, JSON.stringify({ bio: newBio }, null, 2));
      await sock.sendMessage(chatId, { text: `✅ Bio updated to: "${newBio}"` }, { quoted: message });
    } catch (error) {
      console.error('Autobio Error:', error.message);
      await sock.sendMessage(chatId, { text: '❌ Failed to update bio.' }, { quoted: message });
    }
  },
};