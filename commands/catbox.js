const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function getMediaBufferAndExt(message) {
    const m = message.message || {};
    if (m.imageMessage) {
        const stream = await downloadContentFromMessage(m.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.jpg' };
    }
    if (m.videoMessage) {
        const stream = await downloadContentFromMessage(m.videoMessage, 'video');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.mp4' };
    }
    if (m.audioMessage) {
        const stream = await downloadContentFromMessage(m.audioMessage, 'audio');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        // default mp3 for voice/ptt may be opus; still use .mp3 generically
        return { buffer: Buffer.concat(chunks), ext: '.mp3' };
    }
    if (m.documentMessage) {
        const stream = await downloadContentFromMessage(m.documentMessage, 'document');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const fileName = m.documentMessage.fileName || 'file.bin';
        const ext = path.extname(fileName) || '.bin';
        return { buffer: Buffer.concat(chunks), ext };
    }
    if (m.stickerMessage) {
        const stream = await downloadContentFromMessage(m.stickerMessage, 'sticker');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.webp' };
    }
    return null;
}

async function getQuotedMediaBufferAndExt(message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    if (!quoted) return null;
    return getMediaBufferAndExt({ message: quoted });
}

// Upload to catbox.moe
async function uploadToCatbox(filePath, fileName) {
    try {
        const formData = new FormData();
        formData.append('reqtype', 'fileupload');
        formData.append('fileToUpload', fs.createReadStream(filePath), fileName);
        
        const response = await axios.post('https://catbox.moe/user/api.php', formData, {
            headers: formData.getHeaders()
        });
        
        return response.data;
    } catch (error) {
        console.error('Catbox upload error:', error);
        throw new Error('Failed to upload to catbox.moe');
    }
}

async function urlCommand(sock, chatId, message) {
    try {
        // Prefer current message media, else quoted media
        let media = await getMediaBufferAndExt(message);
        if (!media) media = await getQuotedMediaBufferAndExt(message);

        if (!media) {
            await sock.sendMessage(chatId, { text: '📸 *Catbox URL Generator* 📸\n\nPlease send or reply to any media file (image, video, audio, sticker, or document) that you want to convert into a catbox.moe link.' }, { quoted: message });
            return;
        }

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        // Generate a more unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `file_${timestamp}_${randomStr}${media.ext}`;
        const tempPath = path.join(tempDir, fileName);
        
        fs.writeFileSync(tempPath, media.buffer);

        let url = '';
        try {
            // Upload to catbox.moe
            url = await uploadToCatbox(tempPath, fileName);
            
            if (!url || !url.startsWith('http')) {
                throw new Error('Invalid URL received from catbox');
            }
        } finally {
            // Clean up temp file
            setTimeout(() => {
                try { 
                    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); 
                } catch (cleanupError) {
                    console.error('Error cleaning up temp file:', cleanupError);
                }
            }, 3000);
        }

        if (!url) {
            await sock.sendMessage(chatId, { text: '❌ Upload to Catbox Failed\n\nSorry, I couldn\'t upload your media to catbox.moe. Please try again with a different file.' }, { quoted: message });
            return;
        }

        // Send success message with catbox URL
        await sock.sendMessage(chatId, { text: `😺 *Your Catbox Link is Ready!* 😺\n\n🔗 ${url}\n\n❤️‍🔥𝓟𝓻𝓸𝓬𝓮𝓼𝓼𝓮𝓭❄🍀 𝓑𝔂 🌿❄𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2❄🌿` }, { quoted: message });
    } catch (error) {
        console.error('[CATBOX] error:', error?.message || error);
        await sock.sendMessage(chatId, { text: '⚠️ *Catbox Upload Failed*\n\nOops! Something went wrong while uploading your media to catbox.moe. Please make sure the file is valid and try again.' }, { quoted: message });
    }
}

module.exports = urlCommand;;