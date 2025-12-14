require('./setting/config')
const {
    default: baileys, proto, jidNormalizedUser, generateWAMessage,
    generateWAMessageFromContent, getContentType, prepareWAMessageMedia
} = require("@whiskeysockets/baileys");

const {
    downloadContentFromMessage, emitGroupParticipantsUpdate, emitGroupUpdate,
    generateWAMessageContent, makeInMemoryStore, MediaType, areJidsSameUser,
    WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState,
    GroupMetadata, initInMemoryKeyStore, MiscMessageGenerationOptions,
    useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions,
    WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto,
    WALocationMessage, WAContextInfo, WAGroupMetadata, ProxyAgent,
    waChatKey, MimetypeMap, MediaPathMap, WAContactMessage,
    WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage,
    WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE,
    MediariyuInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL,
    WAMediaUpload, mentionedJid, processTime, Browser, MessageType,
    Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers,
    GroupSettingChange, DisriyuectReason, WASocket, getStream, WAProto,
    isBaileys, AnyMessageContent, fetchLatestBaileysVersion,
    templateMessage, InteractiveMessage, Header
} = require("@whiskeysockets/baileys");

const fs = require('fs')
const util = require('util')
const chalk = require('chalk')
const os = require('os')
const axios = require('axios')
const fsx = require('fs-extra')
const crypto = require('crypto')
const googleTTS = require('google-tts-api')
const ffmpeg = require('fluent-ffmpeg')
const speed = require('performance-now')
const timestampp = speed();
const jimp = require("jimp")
const latensi = speed() - timestampp
const moment = require('moment-timezone')
const yts = require('yt-search');
const ytdl = require('@vreden/youtube_scraper');
const { smsg, tanggal, getTime, isUrl, sleep, clockString, runtime, fetchJson, getBuffer, jsonformat, format, parseMention, getRandom, getGroupAdmins, generateProfilePicture } = require('./allfunc/storage')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid, addExif } = require('./allfunc/exif.js')
const kingbadboipic = fs.readFileSync(`./media/image1.jpg`)
const kingbadboiplay = fs.readFileSync('./media/menu.mp3')

module.exports = bad = async (bad, m, chatUpdate, store) => {
    const { from } = m
    try {
        // Message body extraction with proper null checks
        const body = (
            m.mtype === "conversation" ? m.message?.conversation || "" :
            m.mtype === "extendedTextMessage" ? m.message?.extendedTextMessage?.text || "" :
            m.mtype === "imageMessage" ? m.message?.imageMessage?.caption || "" :
            m.mtype === "videoMessage" ? m.message?.videoMessage?.caption || "" :
            m.mtype === "documentMessage" ? m.message?.documentMessage?.caption || "" :
            m.mtype === "audioMessage" ? m.message?.audioMessage?.caption || "" :
            m.mtype === "stickerMessage" ? m.message?.stickerMessage?.caption || "" :
            m.mtype === "buttonsResponseMessage" ? m.message?.buttonsResponseMessage?.selectedButtonId || "" :
            m.mtype === "listResponseMessage" ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || "" :
            m.mtype === "templateButtonReplyMessage" ? m.message?.templateButtonReplyMessage?.selectedId || "" :
            m.mtype === "interactiveResponseMessage" ? (m.msg?.nativeFlowResponseMessage?.paramsJson ? 
                JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id || "" : "") :
            m.mtype === "messageContextInfo" ? m.message?.buttonsResponseMessage?.selectedButtonId ||
                m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || m.text || "" :
            m.mtype === "reactionMessage" ? m.message?.reactionMessage?.text || "" :
            m.mtype === "contactMessage" ? m.message?.contactMessage?.displayName || "" :
            m.mtype === "contactsArrayMessage" ? (m.message?.contactsArrayMessage?.contacts || [])
                .map(c => c.displayName || "").join(", ") :
            m.mtype === "locationMessage" ? `${m.message?.locationMessage?.degreesLatitude || 0}, ${m.message?.locationMessage?.degreesLongitude || 0}` :
            m.mtype === "liveLocationMessage" ? `${m.message?.liveLocationMessage?.degreesLatitude || 0}, ${m.message?.liveLocationMessage?.degreesLongitude || 0}` :
            m.mtype === "pollCreationMessage" ? m.message?.pollCreationMessage?.name || "" :
            m.mtype === "pollUpdateMessage" ? m.message?.pollUpdateMessage?.name || "" :
            m.mtype === "groupInviteMessage" ? m.message?.groupInviteMessage?.groupJid || "" :
            m.mtype === "viewOnceMessage" ? (m.message?.viewOnceMessage?.message?.imageMessage?.caption ||
                m.message?.viewOnceMessage?.message?.videoMessage?.caption || "[Pesan sekali lihat]") :
            m.mtype === "viewOnceMessageV2" ? (m.message?.viewOnceMessageV2?.message?.imageMessage?.caption ||
                m.message?.viewOnceMessageV2?.message?.videoMessage?.caption || "[Pesan sekali lihat]") :
            m.mtype === "viewOnceMessageV2Extension" ? (m.message?.viewOnceMessageV2Extension?.message?.imageMessage?.caption ||
                m.message?.viewOnceMessageV2Extension?.message?.videoMessage?.caption || "[Pesan sekali lihat]") :
            m.mtype === "ephemeralMessage" ? (m.message?.ephemeralMessage?.message?.conversation ||
                m.message?.ephemeralMessage?.message?.extendedTextMessage?.text || "[Pesan sementara]") :
            m.mtype === "interactiveMessage" ? "[Pesan interaktif]" :
            m.mtype === "protocolMessage" ? "[Pesan telah dihapus]" : ""
        );
        
        const budy = (typeof m.text == 'string' ? m.text : '')
        
        // Add null check for body before testing startsWith
        const prefix = global.prefa ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body || '') ? 
            (body || '').match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)?.[0] || "" : "" : 
            global.prefa ?? global.prefix
        
        // Load configuration files with error handling
        let owner = [], Premium = [], orgkaya = [], kontributor = [], premium = [];
        try {
            owner = JSON.parse(fs.readFileSync('./allfunc/owner.json')) || [];
            Premium = JSON.parse(fs.readFileSync('./allfunc/premium.json')) || [];
            orgkaya = JSON.parse(fs.readFileSync('./allfunc/owner.json')) || [];
            kontributor = JSON.parse(fs.readFileSync('./allfunc/owner.json')) || [];
            premium = JSON.parse(fs.readFileSync('./allfunc/premium.json')) || [];
        } catch (e) {
            console.error('Error loading config files:', e);
        }
        
        // Add null check for body before calling startsWith
        const isCmd = body && body.startsWith(prefix)
        const command = body && body.startsWith(prefix) ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body ? body.trim().split(/ +/).slice(1) : []
        const text = args.join(" ")
        
        const botNumber = await bad.decodeJid(bad.user.id)
        const isCreator = [botNumber, ...owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isDev = owner
            .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            .includes(m.sender)
        const isPremium = [botNumber, ...Premium].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = [botNumber, ...premium, ...kontributor].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const qtext = q = args.join(" ")
        const quoted = m.quoted ? m.quoted : m
        const from = m.key.remoteJid
        const { spawn: spawn, exec } = require('child_process')
        const sender = m.isGroup ? (m.key.participant ? m.key.participant : m.participant) : m.key.remoteJid
        
        // FIXED: Proper error handling for group metadata retrieval
        let groupMetadata = {};
        let participants = [];
        let groupAdmins = [];
        let isBotAdmins = false;
        let isAdmins = false;
        let groupName = "";

        if (m.isGroup) {
            try {
                groupMetadata = await bad.groupMetadata(from) || {};
                participants = groupMetadata.participants || [];
                groupAdmins = await getGroupAdmins(participants);
                isBotAdmins = groupAdmins.includes(botNumber);
                isAdmins = groupAdmins.includes(m.sender);
                groupName = groupMetadata.subject || "";
            } catch (e) {
                /*console.error('Error fetching group metadata:', e);*/
                // Set default values instead of crashing
                participants = [];
                groupAdmins = [];
                isBotAdmins = false;
                isAdmins = false;
                groupName = "Unknown Group";
            }
        }
        
        const pushname = m.pushName || "No Name"
        const time = moment(Date.now()).tz('Africa/Lagos').locale('id').format('HH:mm:ss z')
        const mime = (quoted.msg || quoted).mimetype || ''
        const todayDateWIB = new Date().toLocaleDateString('id-ID', {
            timeZone: 'Africa/Lagos',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
// Initialize global objects to prevent undefined errors
if (!global._antilink) global._antilink = {};
if (!global.db) {
    global.db = {
        data: {
            chats: {},
            users: {},
            settings: {}
        }
    };
}

/*       
const reply = (teks) => {
let badboireplyhandler = {      
contextInfo: {
forwardingScore: 999,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterName: "❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥",
newsletterJid: "120363317747980810@newsletter",
},
externalAdReply: {  
showAdAttribution: true,
title: botName, 
body: creatorName,
thumbnailUrl: 'https://files.catbox.moe/imgbam.jpg',
sourceUrl: link
},
},
text: teks,
}
return bad.sendMessage(from, badboireplyhandler, {
quoted: fsaluran,
})
}
*/

const reply = async (text) => {
  await bad.sendMessage(
    from,
    {
      text,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363317747980810@newsletter",
          newsletterName: "❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥",
        },
      },
    },
    { quoted: m }
  );
};

const fsaluran = { key : {
remoteJid: '0@s.whatsapp.net',
participant : '0@s.whatsapp.net'
},
message: {
newsletterAdminInviteMessage: {
newsletterJid: '120363317747980810@newsletter',
    newsletterName: '',
    caption: body
}}}

async function sendImage(imageUrl, caption) {
  bad.sendMessage(m.chat, {
    image: { url: imageUrl },
    caption,
    contextInfo: {
      forwardingScore: 9,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363317747980810@newsletter",
        newsletterName: "❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥",
      }
    }
  }, { quoted: m });
}

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
const kingbadboitech = "𝗘𝗠𝗠𝗬 𝗛𝗘𝗡𝗭 𝗧𝗘𝗖𝗛™✓";

if (!bad.public) {
if (!isCreator) return
}

const example = (teks) => {
return `Usage : *${prefix+command}* ${teks}`
}

let antilinkStatus = {};

if (autobio) {
    bad.updateProfileStatus(`❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥`).catch(_ => _)
}

if (isCmd)  {
    console.log(chalk.black(chalk.bgWhite('[ ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥  ]')), chalk.black(chalk.bgGreen(new Date)), chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('=> From'), chalk.green(pushname), chalk.yellow(m.sender) + '\n' + chalk.blueBright('=>In'), chalk.green(m.isGroup ? pushname : 'Private Chat', m.chat))
}

if (m.isGroup && global._antilink && global._antilink[m.chat]) {
    const linkRegex = /(https?:\/\/[^\s]+)/gi;
    if (linkRegex.test(m.text) && !isAdmins && !isCreator) {
        const warningText = " 😶‍🌫️WARNING: Sending links is not allowed in this group! \n*antilink handler by ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥*";
        await bad.sendMessage(m.chat, { text: warningText }, { quoted: m });
    }
}

if (m.isGroup && antilinkStatus && antilinkStatus[m.chat]) {
    const detectLink = /(https?:\/\/[^\s]+)|(\b\S*\.com\S*\b)/gi;
    if (detectLink.test(m.text)) {
        if (!isgroupAdmins && !m.key.fromMe) {
            await bad.sendMessage(m.chat, { delete: m.key });
        }
    }
}

async function autoJoinGroup(bad, inviteLink) {
  try {
    const inviteCode = inviteLink.match(/([a-zA-Z0-9_-]{22})/)?.[1];
    
    if (!inviteCode) {
      throw new Error('Invalid invite link');
    }
    
    const result = await bad.groupAcceptInvite(inviteCode);
    console.log('✅ Joined group:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Failed to join group:', error.message);
    return null;
  }
}

switch(command) {
case 'chreact':
    if (!isPremium) return reply(`Sorry, only premium users can use this command`);
    if (!args[0]) return reply("Usage:\n.hackreact https://whatsapp.com/channel/abcd");
    if (!args[0].startsWith("https://whatsapp.com/channel/")) return reply("This channel link is invalid.");

    const link = args[0];
    
    // Use only the emojis allowed by the API
    const allowedEmojis = ['😀', '😍', '👍', '❤️', '🔥', '💯', '🎉', '👏', '😂', '🤔', '😮', '🙌'];
    
    try {
        await reply("🔄 Starting hack react process...");

        // Make API calls 3 times with different emoji sets each time
        for (let i = 0; i < 3; i++) {
            // Select 3 random unique emojis from the allowed list
            const selectedEmojis = [];
            const availableEmojis = [...allowedEmojis]; // Create a copy
            
            while (selectedEmojis.length < 3 && availableEmojis.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableEmojis.length);
                const randomEmoji = availableEmojis[randomIndex];
                
                if (!selectedEmojis.includes(randomEmoji)) {
                    selectedEmojis.push(randomEmoji);
                    // Remove the selected emoji to avoid duplicates in the same request
                    availableEmojis.splice(randomIndex, 1);
                }
            }

            // Construct API URL with the selected emojis
            const apiUrl = `https://ab-whatsapp-react.vercel.app/api/autolike?key=ab-badboi-0mzxpd&url=${encodeURIComponent(link)}&react1=${encodeURIComponent(selectedEmojis[0])}&react2=${encodeURIComponent(selectedEmojis[1])}&react3=${encodeURIComponent(selectedEmojis[2])}`;
            
            // Make API request using axios
            try {
                const response = await axios.get(apiUrl);
                const data = response.data;
                
                if (data.success) {
                    console.log(`API call ${i+1} successful with emojis: ${selectedEmojis.join(' ')}`);
                    // Only notify success for each request if you want minimal output
                } else {
                    console.error(`API call ${i+1} failed:`, data.error);
                }
            } catch (axiosError) {
                console.error(`API call ${i+1} error:`, axiosError);
            }
            
            // Add delay between requests (2 seconds)
            if (i < 2) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        reply(`✅ channel react process completed by ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥!`);
        
    } catch (error) {
        console.error('Channel React error:', error);
        reply('❌ Error in hack react process. Please try again later.');
    }
 break;
case 'pair':
    const number = args[0];
    if (!number) return reply('Please provide a phone number. Usage: .pair 23490xxxxxx');
    
    // Remove any non-digit characters from the number
    const cleanNumber = number.replace(/\D/g, '');
    
    // Basic validation - at least 8 digits
    if (cleanNumber.length < 8) return reply('Invalid phone number format. Please provide a valid phone number.');
    
    try {
        await reply('⏳ Generating pairing code...');
        const response = await fetch('https://mini.emmyhenztech.space/request-pairing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: cleanNumber })
        });
        const data = await response.json();
        
        if (data.success) {
            const pairingCode = data.pairingCode;
            const buttonMessage = {
                text: `✅ *PAIRING CODE GENERATED*\n\n📱 *Number:* ${cleanNumber}\n🔢 *Code:* ${pairingCode}\n\n*Follow these steps:*\n1. Open WhatsApp on your phone\n2. Go to Linked Devices\n3. Tap on Link a Device\n4. Enter the 8-digit code above`,
                buttons: [{ buttonId: 'copy', buttonText: { displayText: '📋 Copy Code' }, type: 1 }],
                headerType: 1
            };
            await bad.sendMessage(m.chat, buttonMessage, { quoted: m });
            await reply(pairingCode);
            await sleep(2000);
            await bad.sendMessage(m.chat, { audio: kingbadboiplay, mimetype: 'audio/mpeg' }, { quoted: m });
        } else {
            reply(`❌ Error: ${data.error || 'Failed to generate pairing code'}`);
        }
    } catch (error) {
        console.error('Pairing error:', error);
        reply('❌ Network error. Please try again later.');
    }
break

case 'menu': {
    const menuImages = [
        'https://files.catbox.moe/imgbam.jpg',
        'https://files.catbox.moe/ejyd44.jpg',
        'https://files.catbox.moe/7yte6y.jpg',
        'https://files.catbox.moe/d8l11m.jpg',
        'https://files.catbox.moe/imgbam.jpg'
    ];

    // Randomly select an image for the menu
    const kingbadboiUrl = menuImages[Math.floor(Math.random() * menuImages.length)];

    const menuText = `
╔══════════════════════╗
║   ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥  ║
╚══════════════════════╝
┌────────────────────┐
│✨ Hello *${m.pushName || 'User'}* ✨
│🔥 Status: 𝗢𝗻𝗹𝗶𝗻𝗲 & 𝗥𝗲𝗮𝗱𝘆 🔥
│👑 Owner: *${ownername}*
│⚡ Runtime: *${runtime(process.uptime())}*
│🎯 Prefix: [${prefix}]
│🚀 Version: *1.0.1*
│📱 Deploy: mini.emmyhenztech.space
└────────────────────┘
┏━━━━━━━━━━━━━━━━━━━━┓
┃     👑 𝗢𝗪𝗡𝗘𝗥 𝗣𝗢𝗪𝗘𝗥    ┃
┗━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────┐
│ 🔹 ${prefix}broadcast
│ 🔹 ${prefix}unblock
│ 🔹 ${prefix}block
│ 🔹 ${prefix}eval
│ 🔹 ${prefix}enc
│ 🔹 ${prefix}runtime
│ 🔹 ${prefix}ping
│ 🔹 ${prefix}alive
│ 🔹 ${prefix}reactch
│ 🔹 ${prefix}chreact
│ 🔹 ${prefix}setppbot
│ 🔹 ${prefix}idch
│ 🔹 ${prefix}pair
└────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━┓
┃   👥 𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗡𝗧𝗥𝗢𝗟   ┃
┗━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────┐
│ ⚔️ ${prefix}kick
│ 📢 ${prefix}tagall
│ 👻 ${prefix}hidetag
│ ⬆️ ${prefix}promote
│ ⬇️ ${prefix}demote
│ 🔇 ${prefix}mute
│ 🔊 ${prefix}unmute
│ 🚪 ${prefix}left
│ ➕ ${prefix}add
│ 🏷️ ${prefix}tag
│ 🔗 ${prefix}join
│ 📎 ${prefix}linkgc
│ 🗑️ ${prefix}del
│ 👑 ${prefix}listadmin
│ ⭐ ${prefix}antilink
│ 💥 ${prefix}kickall
│ 📊 ${prefix}groupinfo
│ 📋 ${prefix}gcinfo
│ 💘 ${prefix}ship
│ 📊 ${prefix}poll
└────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━┓
┃     📱 𝗨𝗧𝗜𝗟𝗜𝗧𝗜𝗘𝗦          ┃
┗━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────┐
│ 👀 ${prefix}vv
│ 👁️ ${prefix}vv2
│ 🏠 ${prefix}creategc
│ 📸 ${prefix}ssweb
│ 🎨 ${prefix}s
│ ✂️ ${prefix}take
│ 🖼️ ${prefix}toimg
│ 💬 ${prefix}qc
│ 🌐 ${prefix}tr
│ 🔗 ${prefix}tourl
│ 💾 ${prefix}save
│ 🤖 ${prefix}gpt
│ 🧮 ${prefix}calculator
│ 🧮 ${prefix}calc
│ 📊 ${prefix}count
│ 🔄 ${prefix}reverse
│ 🔠 ${prefix}uppercase
│ 🔡 ${prefix}lowercase
│ ⏰ ${prefix}timer
│ ⏱️ ${prefix}countdown
└────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━┓
┃   📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗛𝗨𝗕   ┃
┗━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────┐
│ 🎵 ${prefix}ytmp3
│ 🎬 ${prefix}ytmp4
│ 📹 ${prefix}video
│ ▶️ ${prefix}play
│ 🔄 ${prefix}play2
│ 🗣️ ${prefix}tts
│ 📌 ${prefix}pinterest
│ 🖼️ ${prefix}pixabay
│ 🌅 ${prefix}img
│ 📱 ${prefix}apk
│ 👸 ${prefix}nwaifu
│ 🌸 ${prefix}rwaifu
│ 💖 ${prefix}waifu
│ 🔗 ${prefix}tinyurl
│ 🖼️ ${prefix}gimage
│ 🎵 ${prefix}ttsearch
│ 📂 ${prefix}gitclone
│ 📷 ${prefix}igdl
│ 🎪 ${prefix}tiktok
│ 🎵 ${prefix}spotify
│ 🐦 ${prefix}twitter
│ ❌ ${prefix}x
│ 🎤 ${prefix}lyrics
└────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━┓
┃  🎨 𝗚𝗙𝗫 𝗟𝗢𝗚𝗢 𝗦𝗧𝗨𝗗𝗜𝗢  ┃
┗━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────┐
│ ✨ ${prefix}gfx
│ 🔥 ${prefix}gfx2
│ 💎 ${prefix}gfx3
│ 🌟 ${prefix}gfx4
│ ⚡ ${prefix}gfx5
│ 🎯 ${prefix}gfx6
│ 🌈 ${prefix}gfx7
└────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━┓
┃    🎵 𝗔𝗨𝗗𝗜𝗢 𝗠𝗔𝗚𝗜𝗖    ┃
┗━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────┐
│ 🔊 ${prefix}bass
│ 💥 ${prefix}blown
│ 👂 ${prefix}earrape
│ 🕳️ ${prefix}deep
│ ⚡ ${prefix}fast
│ 🌙 ${prefix}nightcore
│ ↩️ ${prefix}reverse
│ 🤖 ${prefix}robot
│ 🐌 ${prefix}slow
│ ✨ ${prefix}smooth
│ 🐿️ ${prefix}squirrel
└────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━┓
┃    🎮 𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘𝗦      ┃
┗━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────┐
│ 😂 ${prefix}meme
│ 😎 ${prefix}emojimix
│ 🪙 ${prefix}coin
│ 🪙 ${prefix}flipcoin
│ 🎲 ${prefix}dice
│ 🎲 ${prefix}roll
│ 💭 ${prefix}quote
│ 💭 ${prefix}randomquote
│ 😄 ${prefix}joke
│ 😄 ${prefix}randomjoke
│ 🧠 ${prefix}fact
│ 🧠 ${prefix}randomfact
└────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━┓
┃    🌍 𝗜𝗡𝗙𝗢 & 𝗧𝗢𝗢𝗟𝗦    ┃
┗━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────┐
│ 🌤️ ${prefix}weather
└────────────────────┘

╔═════════════════════╗
║ 🚀 Try any command! 🚀 ║
║  💫 Power awaits! 💫     ║
╚═════════════════════╝`;
/*
    const fakeSystem = {
        key: {
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Kingbadboi12345",
            participant: "0@s.whatsapp.net"
        },
        message: {
            conversation: "𝙆𝙞𝙣𝙜 𝘽𝙖𝙙𝙗𝙤𝙞"
        }
    };
*/
    // Send the menu image with the caption
    await bad.sendMessage(from, {
        image: { url: kingbadboiUrl },
        caption: menuText
    }, { quoted: m });

    // Wait for 2 seconds before sending the audio message
    await sleep(2000)

await bad.sendMessage(m.chat, {

audio: kingbadboiplay,

mimetype: 'audio/mpeg'

}, { quoted: m

})


}
break;

case 'antilink': {
if (!isCreator) return m.reply("```for Owner only```.");
    if (!m.isGroup) return reply("This command only works in group chats.");
    if (!isAdmins) return reply("Only group admins can use this command.");
    if (!args[0]) return reply(`Example: ${prefix}antilink on/off`);

    if (args[0].toLowerCase() === 'on') {
        antilinkStatus[m.chat] = true;
        return reply("Antilink is now *enabled* in this group.");
    } else if (args[0].toLowerCase() === 'off') {
        antilinkStatus[m.chat] = false;
        return reply("Antilink is now *disabled* in this group.");
    } else {
        return reply("Use 'on' or 'off' only.");
    }
}
break;
       case "kickall":


if (!m.isGroup) return reply(mess.group)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!isAdmins) return reply(mess.admin)
let users = participants.filter((u) => !areJidsSameUser(u.id, bad.user.id)); 
   let kickedUser = []; 
   for (let user of users) { 
     if (user.id.endsWith("@s.whatsapp.net") && !user.admin) { 
       await kickedUser.push(user.id); 
       await sleep(1 * 1000); 
     } 
   } 
   if (!kickedUser.length >= 1) 
     return reply("In this group there are no members except you and me"); 
   const res = await bad.groupParticipantsUpdate(m.chat, kickedUser, "remove"); 
   await sleep(3000); 
   await reply( 
     `sucessfully kicked member\n${kickedUser.map( 
       (v) => "@" + v.split("@")[0] 
     )}`, 
     null, 
     { 
       mentions: kickedUser, 
     } 
   ); 
break;
case 'checkidch': case 'idch': {
if (!isCreator) return reply(`Sorry, only the owner can use this command`)
if (!text) return reply("example : link channel")
if (!text.includes("https://whatsapp.com/channel/")) return reply("not a valid Link ")
let result = text.split('https://whatsapp.com/channel/')[1]
let res = await bad.newsletterMetadata("invite", result)
let teks = `
* *ID :* ${res.id}
* *Name :* ${res.name}
* *Follower:* ${res.subscribers}
* *Status :* ${res.state}
* *Verified :* ${res.verification == "VERIFIED" ? "Verified" : "No"}
`
return reply(teks)
}
break;
case 'bass': case 'blown': case 'deep': case 'earrape': case 'fast': case 'fat': case 'nightcore': case 'reverse': case 'robot': case 'slow': case 'smooth': case 'squirrel':
    try {
        let set;
        if (/bass/.test(command)) set = '-af equalizer=f=54:width_type=o:width=2:g=20';
        else if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log';
        else if (/deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3';
        else if (/earrape/.test(command)) set = '-af volume=12';
        else if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"';
        else if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"';
        else if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25';
        else if (/reverse/.test(command)) set = '-filter_complex "areverse"';
        else if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
        else if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"';
        else if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
        else if (/squirrel/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"';
        if (set) {
            if (/audio/.test(mime)) {
                let media = await bad.downloadAndSaveMediaMessage(quoted);
                let ran = getRandom('.mp3');
                console.log(`Running ffmpeg command: ffmpeg -i ${media} ${set} ${ran}`);
                exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
                    fs.unlinkSync(media);
                    if (err) {
                        console.error(`ffmpeg error: ${err}`);
                        return reply(err);
                    }
                    
                    let buff = fs.readFileSync(ran);
                    bad.sendMessage(m.chat, { audio: buff, mimetype: 'audio/mpeg' }, { quoted: m });
                    fs.unlinkSync(ran);
                });
            } else {
                reply(`Reply to the audio you want to change with a caption *${prefix + command}*`);
            }
        } else {
            reply('Invalid command');
        }
    } catch (e) {
        reply(e);
    }
    break;
case 'ytmp3':
case 'ytaudio': {
  if (!text) return reply(` *Usage:* ${prefix}ytmp3 <YouTube URL>`);

  const ytUrl = encodeURIComponent(text.trim());
  const apiUrl = `https://fastrestapis.fasturl.cloud/downup/ytmp3?url=${ytUrl}&quality=128kbps&server=auto`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.error('API Error:', res.status);
      return reply('❌ Failed to fetch audio. Try again later.');
    }

    const { result } = await res.json();
    if (!result || !result.media) return reply('⚠️ No audio found.');

    const {
      title,
      media,
      quality,
      url,
      metadata,
      author
    } = result;

    const caption = `
┌──⭓${botname} ──⭓
🎵 *Title:* ${title}
🎙️ *Author:* ${author.name}
🕒 *Duration:* ${metadata.duration}
📅 *Uploaded:* ${metadata.uploadDate}
👁️ *Views:* ${metadata.views}
🎧 *Quality:* ${quality}
🔗 *YouTube:* ${url}
└─────────────®
`;

    // Send thumbnail & info first
    await bad.sendMessage(m.chat, {
      image: { url: metadata.thumbnail },
      caption,
    }, { quoted: m });

    // Then send audio
    await bad.sendMessage(m.chat, {
      audio: { url: media },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m });

  } catch (err) {
    console.error('YTMP3 ERROR:', err);
    reply('⚠️ Error occurred while processing audio.');
  }
  break;
}
case 'ytmp4':
case 'ytvideo': {
  if (!text) return reply(` *Usage:* ${prefix}ytmp4 <YouTube URL>`);

  const ytUrl = encodeURIComponent(text.trim());
  const apiUrl = `https://fastrestapis.fasturl.cloud/downup/ytmp4?url=${ytUrl}&quality=720&server=auto`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.error('API Error:', res.status);
      return reply('❌ Failed to fetch video. Try again later.');
    }

    const { result } = await res.json();
    if (!result || !result.media) return reply('No video found.');

    const {
      title,
      media,
      quality,
      url,
      metadata,
      author
    } = result;

    const caption = `
┌──⭓${botname} ──⭓
🎬 *Title:* ${title}
🎙️ *Author:* ${author.name}
🕒 *Duration:* ${metadata.duration}
📅 *Uploaded:* ${metadata.uploadDate}
👁️ *Views:* ${metadata.views}
📥 *Quality:* ${quality}
🔗 *YouTube:* ${url}
└────────────®
`;

    // Send preview first
    await bad.sendMessage(m.chat, {
      image: { url: metadata.thumbnail },
      caption,
    }, { quoted: m });

    // Send the actual video
    await bad.sendMessage(m.chat, {
      video: { url: media },
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption: `🎞️ ${title}`
    }, { quoted: m });

  } catch (err) {
    console.error('YTMP4 ERROR:', err);
    reply('⚠️ Error occurred while processing video.');
  }
  break;
}

case 'video':
case 'ytsearch': {
  if (!text) return reply(`*Usage:* ${prefix}ytvideo <search keywords>`);

  try {
    // Search YouTube for videos
    const results = await richyts.GetListByKeyword(text, false, 1, [{ type: "video" }]);
    const video = results.items?.[0];
    if (!video) return reply("❌ No video found.");

    const ytUrl = `https://youtu.be/${video.id}`;
    const apiUrl = `https://fastrestapis.fasturl.cloud/downup/ytmp4?url=${encodeURIComponent(ytUrl)}&quality=720&server=auto`;

    // Fetch video download link from FastRest
    const fetchRes = await fetch(apiUrl);
    if (!fetchRes.ok) return reply("⚠️ Couldn't fetch video info.");
    const { result } = await fetchRes.json();

    const {
      title,
      media,
      quality,
      url,
      metadata,
      author
    } = result;

    const caption = `
🎬 *Title:* ${title}
🎙️ *Author:* ${author.name}
🕒 *Duration:* ${metadata.duration}
📅 *Uploaded:* ${metadata.uploadDate}
👁️ *Views:* ${metadata.views}
📥 *Quality:* ${quality}
🔗 *YouTube:* ${url}
`;

    // Send thumbnail first
    await bad.sendMessage(m.chat, {
      image: { url: metadata.thumbnail },
      caption,
    }, { quoted: m });

    // Then send the actual video
    await bad.sendMessage(m.chat, {
      video: { url: media },
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption: `🎞️ ${title}`
    }, { quoted: m });

  } catch (e) {
    console.error('YTSEARCH ERROR:', e);
    reply("❌ Error searching and downloading video.");
  }
  break;
}
case 'say': case 'tts': case 'gtts':{

if (!qtext) return reply('Where is the text?')
            let texttts = text
            const xeonrl = googleTTS.getAudioUrl(texttts, {
                lang: "en",
                slow: false,
                host: "https://translate.google.com",
            })
            return bad.sendMessage(m.chat, {
                audio: {
                    url: xeonrl,
                },
                mimetype: 'audio/mp4',
                ptt: true,
                fileName: `${text}.mp3`,
            }, {
                quoted: m,
            })
        }
        break;
     case "play2":{
                if (!text) return reply(`\n*ex:* ${prefix + command} fucklove\n`)
                let mbut = await fetchJson(`https://ochinpo-helper.hf.space/yt?query=${text}`)
                let ahh = mbut.result
                let crot = ahh.download.audio

                bad.sendMessage(m.chat, {
                    audio: { url: crot },
                    mimetype: "audio/mpeg", 
                    ptt: true
                }, { quoted: m })
            }
            break;
        case 'apk':
case 'apkdl': {
  if (!text) {
    return reply(` *Example:* ${prefix + command} com.whatsapp`);
  }
  
  try {
    const packageId = text.trim();
    const res = await fetch(`https://api.bk9.dev/download/apk?id=${encodeURIComponent(packageId)}`);
    const data = await res.json();

    if (!data.status || !data.BK9 || !data.BK9.dllink) {
      return reply(' *APK not found.* The package ID might be incorrect or the API failed. Please try a different one.');
    }

    const { name, hackbadboi, dllink, package: packageName } = data.BK9;

    await bad.sendMessage(m.chat, {
      image: { url: hackbadboi },
      caption:
`╭〔 *📦 APK Downloader* 〕─⬣
│
│ 🧩 *Name:* _${name}_
│ 📁 *Package:* _${packageName}_
│ 📥 *Download:* [Click Here](${dllink})
│
╰────────────⬣
_Sending file, please wait..._`
    }, { quoted: m });

    await bad.sendMessage(m.chat, {
      document: { url: dllink },
      fileName: `${name}.apk`,
      mimetype: 'application/vnd.android.package-archive'
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    reply('*Failed to fetch APK.* An unexpected error occurred. Please try again later.');
  }
}
break;
// waifu cases
case "nwaifu": {

    const apiUrl = `https://reaperxxxx-anime.hf.space/api/waifu?category=waifu&sfw=true`;
    const response = await axios.get(apiUrl);
    const data = await response.data;
    const imageUrl = data.image_url
    
    await bad.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: "```❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥```"
      }, { quoted: m }); // Add quoted option for context
      }
      break
    case "rwaifu": {
    
    const imageUrl = `https://apis.davidcyriltech.my.id/random/waifu`;
    await bad.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: "```❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥```"
      }, { quoted: m }); // Add quoted option for context
      }
      break;
      case 'waifu' :

waifudd = await axios.get(`https://waifu.pics/api/nsfw/waifu`) 
bad.sendMessage(from, {image: {url:waifudd.data.url},caption:`Your waifu by ${botname} MD`}, { quoted:m }).catch(err => {
 return('Error!')
})
break;      
case 'vv': {
if (!isCreator) return reply("```Nuh-uh~ Only my beloved Master can use this!```");
    if (!m.quoted) return reply('Hehe~ You forgot to reply to a view-once image, video, or voice note!');

    try {
        const mediaBuffer = await bad.downloadMediaMessage(m.quoted);

        if (!mediaBuffer) {  
            return reply('Eep~ I couldn’t grab the media. Can you try again, please?\n~ Yours truly, 𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃');  
        }  

        const mediaType = m.quoted.mtype;  
        const footer = "\n─────⸙ *𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃 ²⁵*";

        if (mediaType === 'imageMessage') {  
            await bad.sendMessage(m.chat, {   
                image: mediaBuffer,   
                caption: "*Image unsealed successfully~*" + footer  
            }, { quoted: m });
        } else if (mediaType === 'videoMessage') {  
            await bad.sendMessage(m.chat, {   
                video: mediaBuffer,   
                caption: "*Video unsealed for Master~*" + footer  
            }, { quoted: m });
        } else if (mediaType === 'audioMessage') {  
            await bad.sendMessage(m.chat, {   
                audio: mediaBuffer,   
                mimetype: 'audio/ogg',  
                ptt: true,  
                caption: "*Here's the secret voice~*" + footer  
            }, { quoted: m });
        } else {  
            return reply('Uwaa~ I can only reveal images, videos, or voice notes, Master!\n~ Your loyal 𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃.');  
        }
    } catch (error) {
        console.error('Error:', error);
        await reply('Ahh~ Something went wrong! Try again or use `.save`, okay?\n~ Kiss from 𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃!');
    }
}
break;
case "hmp": case "vv2": case "readviewonce2": {

if (!isCreator) return reply("```for Owner only```.");
    if (!m.quoted) {
        return reply(`*Reply to an image, video, or audio with the caption ${prefix + command}*`);
    }

    let mime = (m.quoted.msg || m.quoted).mimetype || '';
    try {
        if (/image/.test(mime)) {
            let media = await m.quoted.download();
            await bad.sendMessage(botNumber, {
                image: media,
                caption: " ",
            }, { quoted: m });

        } else if (/video/.test(mime)) {
            let media = await m.quoted.download();
            await bad.sendMessage(botNumber, {
                video: media,
                caption: "",
            }, { quoted: m });

        } else if (/audio/.test(mime)) {
            let media = await m.quoted.download();
            await bad.sendMessage(botNumber, {
                audio: media,
                mimetype: 'audio/mpeg',
                ptt: true // Set to true if you want to send as a voice note
            }, { quoted: m });

        } else {
            reply(`❌ Unsupported media type!\nReply to an image, video, or audio with *${prefix + command}*`);
        }
    } catch (err) {
        console.error('Error processing media:', err);
        reply(` Failed to process media. Please try again.`);
    }
}
break;
case 'qc': {
  if (!text) return reply('Use format: *.qc your quote*');

  const name = m.pushName || 'User';
  const quote = text.trim();

  let profilePic;
  try {
    profilePic = await bad.profilePictureUrl(m.sender, 'image');
  } catch {
    profilePic = 'https://telegra.ph/file/6880771c1f1b5954d7203.jpg'; // fallback
  }

  const url = `https://www.laurine.site/api/generator/qc?text=${encodeURIComponent(quote)}&name=${encodeURIComponent(name)}&photo=${encodeURIComponent(profilePic)}`;

  try {
    await bad.sendImageAsSticker(m.chat, url, m, {
      packname: global.packname,
      author: global.author
    });
  } catch (err) {
    console.error('Quote card sticker generation error:', err);
    reply('Oops! Failed to create your quote sticker.');
  }
}
break;

case 'tinyurl':
case 'shorturl':{
if (!text) return reply('```*[ Wrong! ]* link/url```')
let shortUrl1 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
if (!shortUrl1) return reply(`*Error: Could not generate a short URL.*`);
let done = `*❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥*\n\n*Original Link :*\n${text}\n*Shortened :*\n${shortUrl1}`.trim();
 reply(done)
}
break;
case 'gimage': 
case 'gptimage': {
    if (!text) return reply('Give me your image description\n\nExample: .gptimage long haired anime girl with blue eyes')
 
    m.reply('_Wait..._')
 
    const gpt1image = async (yourImagination) => {
        const headers = {
            "content-type": "application/json",
            "referer": "https://gpt1image.exomlapi.com/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
        }
 
        const body = JSON.stringify({
            "prompt": yourImagination,
            "n": 1,
            "size": "1024x1024",
            "is_enhance": true,
            "response_format": "url"
        })
 
        const response = await fetch("https://gpt1image.exomlapi.com/v1/images/generations", {
            headers,
            body,
            method: "POST"
        })
 
        if (!response.ok) throw Error(`fetch failed at address ${response.url} ${response.status} ${response.statusText}.`)
 
        const json = await response.json()
        const url = json?.data?.[0]?.url
 
        if (!url) throw Error(" fetch successful but result url is empty" + (json.error ? ", error from server : " + json.error : "."))
 
        return url
    }
 
    try {
        const imageUrl = await gpt1image(text)
        await bad.sendMessage(m.chat, {
            image: { url: imageUrl }
        }, { quoted: m })
    } catch (error) {
        m.reply(`${error.message}`)
    }
}
break;
case 'enc':
case 'obf':
case 'jsobfuscate': {
  if (!m.quoted || !m.quoted.text) return reply(' Reply to a JavaScript code block to obfuscate.');

  const code = m.quoted.text.trim();
  const encoded = encodeURIComponent(code);
  const api = `https://fastrestapis.fasturl.cloud/tool/jsobfuscate?inputCode=${encoded}&encOptions=NORMAL&specialCharacters=on&fastDecode=off`;

  try {
    const res = await fetch(api);
    const json = await res.json();

    if (json.status !== 200 || !json.result) {
      return reply(' Failed to obfuscate the code.');
    }

    const fileBuffer = Buffer.from(json.result, 'utf-8');
    await bad.sendMessage(m.chat, {
      document: fileBuffer,
      mimetype: 'application/javascript',
      fileName: '𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃obf.js',
      caption: 'JavaScript Obfuscated Successfully'
    }, { quoted: m });

  } catch (err) {
    console.error('[JS OBF ERROR]', err);
    reply(' An error occurred while obfuscating the code.');
  }
  break;
}
case 'pixabay': {
  if (!text) {
    return reply(` *Pixabay Image Search*\n\nExample: pixabay mountain sunset\n\n⚡ Powered by ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥`);
  }

  const waitMsg = await reply(` *Searching Pixabay* \n\n▰▱▱▱▱▱▱▱▱▱ 25%\nLooking for "${text}"...`);
  const url = `https://api.nexoracle.com/search/pixabay-images?apikey=63b406007be3e32b53&q=${encodeURIComponent(text)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data?.result?.length) {
      return reply(`*No Images Found* ❌\n\nCouldn't find Pixabay images for:\n"${text}"\n\n• Try different keywords\n• Use English terms for best results\n\n⚡ Powered by ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥`);
    }

    for (let i = 0; i < Math.min(data.result.length, 5); i++) {
      await sendImage(data.result[i], `🖼️ Image ${i+1} for "${text}"\n\n⚡ Powered by ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥`);
      if (i < 4) await delay(500);
    }

    await react('✅');

  } catch (e) {
    console.error('Pixabay error:', e);
    reply(' Failed to fetch images. Try again later.');
  }

  break;
}
case 'pin': 
case 'pinterest': {
  if (!text) return reply(' *Example:* pinterest Furry');

  try {
    const res = await fetch(`https://fastrestapis.fasturl.cloud/search/pinterest/simple?name=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (data.status !== 200 || !Array.isArray(data.result)) {
      return reply('❌ Failed to fetch Pinterest images.');
    }

    const pick = data.result[Math.floor(Math.random() * data.result.length)];
    const caption = `🎀 *Pinterest Result*\n\n📌 *Title:* ${pick.title || 'N/A'}\n🖼️ *Alt Text:* ${pick.altText || 'N/A'}\n💬 *Description:* ${pick.description || 'N/A'}\n🔗 *Link:* ${pick.link}`;

    await bad.sendMessage(m.chat, {
      image: { url: pick.directLink },
      caption: caption
    }, { quoted: m });

  } catch (e) {
    console.error('[PINTEREST ERROR]', e);
    reply(' Error fetching Pinterest data. Try again later.');
  }
  break;
}
case 'broadcast':
case 'bc': {
  if (!isCreator) return reply('```For Owner only.```');
  if (!text && !(m.quoted && m.quoted.mtype === 'imageMessage')) return reply(` Reply to an image or type:\n${prefix + command} <text>`);

  const groups = Object.keys(await bad.groupFetchAllParticipating());
  await reply(` Broadcasting to ${groups.length} groups...`);

  const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363317747980810@newsletter",
      newsletterName: "❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥"
    }
  };

  const bcText = `╭─〔 𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓 𝐁𝐘 𝐎𝐖𝐍𝐄𝐑 〕\n│ ${text.split('\n').join('\n│ ')}\n╰─⸻⸻⸻⸻`;

  for (let id of groups) {
    await sleep(1500);

    try {
      if (m.quoted && m.quoted.mtype === 'imageMessage') {
        const media = await bad.downloadAndSaveMediaMessage(m.quoted);
        await bad.sendMessage(id, {
          image: { url: media },
          caption: bcText,
          contextInfo
        });
      } else {
        await bad.sendMessage(id, {
          text: bcText,
          contextInfo
        });
      }
    } catch (err) {
      console.error(` Broadcast to ${id} failed:`, err);
    }
  }

  reply(' Broadcast finished.');
}
break;
case 'unblock': case 'unblocked': {

	 if (!isCreator) return reply("```for Owner only```.");
		let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
		await bad.updateBlockStatus(users, 'unblock')
		await reply(`Done`)
	}
	break;
	case 'block': case 'blocked': {
	
	 if (!isCreator) return reply("```for Owner only```.");
		let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
		await bad.updateBlockStatus(users, 'block')
		await reply(`Done`)
			}
	break;

case 'creategc':
case 'creategroup': {
  if (!isCreator) return reply("```For Owner only```.");

  const groupName = args.join(" ");
  if (!groupName) return reply(`Use *${prefix + command} groupname*`);

  try {
    const cret = await bad.groupCreate(groupName, []);
    const code = await bad.groupInviteCode(cret.id);
    const link = `https://chat.whatsapp.com/${code}`;

    const teks = `「 Group Created 」
▸ *Name:* ${cret.subject}
▸ *Group ID:* ${cret.id}
▸ *Owner:* @${cret.owner.split("@")[0]}
▸ *Created:* ${moment(cret.creation * 1000).tz("Africa/Lagos").format("DD/MM/YYYY HH:mm:ss")}
▸ *Invite Link:* ${link}`;

    bad.sendMessage(m.chat, {
      text: teks,
      mentions: [cret.owner]
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    reply("❌ Failed to create group. Please check and try again.");
  }
}
break;
case 'ss':
case 'ssweb':
  if (!text) return reply(' *Please provide a URL to screenshot!*\n\nExample:\nssweb https://google.com');
  try {
    const ssApi = `https://api-rebix.vercel.app/api/ssweb?url=${encodeURIComponent(text)}`;
    const { data } = await axios.get(ssApi, { responseType: 'arraybuffer' });

    await bad.sendMessage(m.chat, {
      image: data,
      caption: `🖼️ Screenshot of:\n${text}\n\n> POWERED by ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥`
    }, { quoted: m });
  } catch (e) {
    console.error('[SSWEB ERROR]', e);
    reply('❌ Failed to get screenshot. Make sure the URL is valid and try again.');
  }
  break;
  case 'img':
case 'image':
case 'searchimage': {
  if (!text) return reply(`*Usage:* \`${prefix}image <query>\`\nExample: \`${prefix}image furry\``);

  try {
    const apiUrl = `https://fastrestapis.fasturl.cloud/search/gimage?ask=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      console.error(`API Error: ${res.status}`);
      return reply('⚠️ Image service unavailable. Try again later.');
    }

    const json = await res.json();
    const data = json.result;

    if (!Array.isArray(data) || data.length === 0) {
      return reply(` No images found for "${text}"`);
    }

    // Send first 5 images
    for (let i = 0; i < Math.min(data.length, 5); i++) {
      const img = data[i]?.image;
      if (!img) continue;

      try {
        await bad.sendMessage(m.chat, {
          image: { url: img },
          caption: `🖼️ *${text}*\n🔗 ${data[i].title}`
        }, { quoted: m });
      } catch (e) {
        console.error(`❌ Failed to send image #${i+1}:`, e.message);
      }
    }

  } catch (err) {
    console.error('IMAGE SEARCH ERROR:', err);
    reply(`⚠️ Error: ${err.message}`);
  }
  break;
}
case 'eval': {
  if (!isOwner) return reply('This command is only for the owner.');
  try {
    let evaled = await eval(`(async () => { ${text} })()`);
    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
    reply(evaled);
  } catch (err) {
    reply(`Error:\n${err}`);
  }
}
break;
// take 
case 'toimg':
  {
    const quoted = m.quoted ? m.quoted : null
    const mime = (quoted?.msg || quoted)?.mimetype || ''
    if (!quoted) return reply('Reply to a sticker/image.')
    if (!/webp/.test(mime)) return reply(`Reply to a sticker with *${prefix}toimg*`)
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
    const media = await bad.downloadMediaMessage(quoted)
    const filePath = `./tmp/${Date.now()}.jpg`
    fs.writeFileSync(filePath, media)
    await bad.sendMessage(m.chat, { image: fs.readFileSync(filePath) }, { quoted: m })
    fs.unlinkSync(filePath)
  }
  break
  case 'ttsearch': {
    const dann = require('d-scrape')
if (!text) return reply(` cindigo `)
await bad.sendMessage(m.chat, {react: {text: '📥', key: m.key}})
try {
let anu = await dann.search.tiktoks(text)
bad.sendMessage(m.chat, { video: { url: anu.no_watermark }, mimetype: 'video/mp4', caption: anu.title }, { quoted : m })
} catch (error) {
m.reply('Error : cannot fetch from query')
}
}
  break;

case 'take':
case 'steal':
case 'stickerwm':
case 'sticker':
case 's':
  {
    const quoted = m.quoted ? m.quoted : null
    const mime = (quoted?.msg || quoted)?.mimetype || ''
    if (!quoted) return reply('Reply to a sticker.')
    if (!/image|video/.test(mime)) return reply(`Reply to a sticker to take\nExample: .take Baby|EmmyHenz`)
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
    let { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter')
    const mediaPath = await bad.downloadAndSaveMediaMessage(quoted)
    const text = args.join(' ') || ''
    const [pack, author] = text.split('|')
    const sticker = new Sticker(mediaPath, {
      pack: pack || global.packname,
      author: author || global.author,
      type: StickerTypes.FULL,
      quality: 70,
      categories: ['🤖'],
      id: '❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥',
      background: '#00000000'
    })
    const stickerPath = `./tmp/${Date.now()}.webp`
    await sticker.toFile(stickerPath)
    const buffer = fs.readFileSync(stickerPath)
    await bad.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
    fs.unlinkSync(mediaPath)
    fs.unlinkSync(stickerPath)
  }
  break
  case "play": {
if (!text) return reply(example("past lives"))
await bad.sendMessage(m.chat, {react: {text: '🦜', key: m.key}})
let ytsSearch = await yts(text)
const res = await ytsSearch.all[0]

var anu = await ytdl.ytmp3(`${res.url}`)

if (anu.status) {
let urlMp3 = anu.download.url
await bad.sendMessage(m.chat, {audio: {url: urlMp3}, mimetype: "audio/mpeg", contextInfo: { externalAdReply: {thumbnailUrl: res.thumbnail, title: res.title, body: `Author ${res.author.name} || Duration ${res.timestamp}`, sourceUrl: res.url, renderLargerThumbnail: true, mediaType: 1}}}, {quoted: m})
await bad.sendMessage(m.chat, {react: {text: '', key: m.key}})
} else {
return reply("Error! Result Not Found")
}
}
break;
case 'gfx':
case 'gfx2':
case 'gfx3':
case 'gfx4':
case 'gfx5':
case 'gfx6':
case 'gfx7': {
  const [text1, text2] = text.split('|').map(v => v.trim());
  if (!text1 || !text2) {
    return reply(` *❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥 - GFX*\n\n\`\`\`Example:\`\`\` *${prefix + command} 𝗘𝗺𝗺𝘆𝗛𝗲𝗻𝘇 | Dev*`);
  }

  reply(` *Generating your stylish image...*\n\n🔤 *Text 1:* ${text1}\n🔡 *Text 2:* ${text2}\n\n⏳ Please wait!`);

  try {
    const style = command.toUpperCase();
    const apiUrl = `https://api.nexoracle.com/image-creating/${command}?apikey=d0634e61e8789b051e&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;

    await sendImage(apiUrl, `✨ *❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥 - ${style} Style*\n\n🔤 *Text 1:* ${text1}\n🔡 *Text 2:* ${text2}`);
  } catch (err) {
    console.error(err);
    reply(`❌ *𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃 Error: Failed to generate ${command.toUpperCase()} image.*`);
  }
  break;
}
case 'kick': {
  if (!m.quoted) return reply("```Tag or quote the user to kick!```");
  if (!m.isGroup) return reply("```Group command only```");
  if (!isAdmins) return reply("``` Only group admins can kick```");
  if (!isBotAdmins) return reply("``` Bot must be admin```");

  let users = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await bad.groupParticipantsUpdate(m.chat, [users], 'remove');
  reply("``` User has been kicked```");
}
break;

case 'tagadmin':
case 'listadmin':
case 'admin': {
  if (!isCreator) return reply("``` For Owner only```");
  if (!m.isGroup) return reply("```Group command only```");

  const groupAdmins = participants.filter(p => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';

  let text = `* Group Admins:*\n${listAdmin}`;
  bad.sendMessage(m.chat, {
    text,
    mentions: [...groupAdmins.map(v => v.id), owner]
  }, { quoted: m });
}
break;

case 'delete':
case 'del': {
  if (!isCreator) return reply("``` For Owner only```");
  if (!m.quoted) return reply("``` Reply to a message to delete it```");

  bad.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.quoted.id,
      participant: m.quoted.sender
    }
  });
}
break;

case 'linkgroup':
case 'linkgc':
case 'gclink':
case 'grouplink': {
  if (!m.isGroup) return reply("```Group command only```");
  if (!isBotAdmins) return reply("``` Bot must be admin```");

  let response = await bad.groupInviteCode(m.chat);
  bad.sendText(m.chat, `https://chat.whatsapp.com/${response}\n\n*🔗 Group Link:* ${groupMetadata.subject}`, m, { detectLink: true });
}
break;

case 'join': {
  if (!isCreator) return reply("``` For Owner only```");
  if (!text) return reply(`Example: *${prefix + command} <group link>*`);
  if (!isUrl(args[0]) || !args[0].includes('whatsapp.com')) return reply("```❌ Invalid group link!```");

  let result = args[0].split('https://chat.whatsapp.com/')[1];
  await bad.groupAcceptInvite(result);
  reply("``` Successfully joined the group```");
}
break;
case 'tag':
case 'totag': {
  if (!m.isGroup) return reply("```Group command only```");
  if (!isAdmins) return reply("``` Only group admins```");
  if (!isBotAdmins) return reply("``` Bot must be admin```");
  if (!m.quoted) return reply(`Reply with ${prefix + command} to a message`);

  bad.sendMessage(m.chat, {
    forward: m.quoted.fakeObj,
    mentions: participants.map(a => a.id)
  });
}
break;
case 'tagall': {
  if (!isCreator) return reply("```For Owner only```");
  if (!m.isGroup) return reply("```Group command only```");

  const textMessage = args.join(" ") || "No context";
  let teks = `\`\`\` Tagging all members:\`\`\`\n> *${textMessage}*\n\n`;

  const groupMetadata = await bad.groupMetadata(m.chat);
  const participants = groupMetadata.participants;

  for (let mem of participants) {
    teks += `@${mem.id.split("@")[0]}\n`;
  }

  bad.sendMessage(m.chat, {
    text: teks,
    mentions: participants.map((a) => a.id)
  }, { quoted: m });
}
break;

case 'hidetag': {
  if (!isCreator) return reply("``` For Owner only```");
  const groupMetadata = await bad.groupMetadata(m.chat);
  const participants = groupMetadata.participants;
  
  bad.sendMessage(m.chat, {
    text: q || '',
    mentions: participants.map(a => a.id)
  }, { quoted: m });
}
break;

case 'promote': {
  if (!m.isGroup) return reply("```Group command only```");
  if (!isAdmins) return reply("```Only group admins can use this!```");
  if (!isBotAdmins) return reply("``` Bot needs to be admin first!```");

  let users = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await bad.groupParticipantsUpdate(m.chat, [users], 'promote');
  reply("```User promoted to admin```");
}
break;

break;
case 'demote': {
  if (!m.isGroup) return reply("```Group command only```");
  if (!isAdmins) return reply("```Only group admins can use this!```");
  if (!isBotAdmins) return reply("``` Bot needs to be admin first!```");

  let users = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await bad.groupParticipantsUpdate(m.chat, [users], 'demote');
  reply("``` User demoted from admin```");
}
break;

case 'mute': {
  if (!m.isGroup) return reply("```Group command only```");
  if (!isAdmins) return reply("```Admins only```");
  if (!isBotAdmins) return reply("``` Bot needs to be admin```");

  await bad.groupSettingUpdate(m.chat, 'announcement');
  reply("``` Group muted. Only admins can send messages now.```");
}
break;

case 'unmute': {
  if (!m.isGroup) return reply("``` Group command only```");
  if (!isAdmins) return reply("``` Admins only```");
  if (!isBotAdmins) return reply("``` Bot needs to be admin```");

  await bad.groupSettingUpdate(m.chat, 'not_announcement');
  reply("``` Group unmuted. Everyone can send messages.```");
}
break;

case 'left': {
  if (!isCreator) return reply("```For Owner only```");
  await bad.groupLeave(m.chat);
  reply("``` Bot left the group```");
}
break;

case 'add': {
  if (!isCreator) return reply("``` For Owner only```");
  if (!m.isGroup) return reply("```Group command only```");
  if (!isBotAdmins) return reply("``` Bot must be admin```");

  let users = m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await bad.groupParticipantsUpdate(m.chat, [users], 'add');
  reply("``` User added to group```");
}
break;
case 'tiktok':
case 'tt':
    {
        if (!text) {
            return reply(`Example: ${prefix + command} link`);
        }
        if (!text.includes('tiktok.com')) {
            return reply(`Link Invalid!! Please provide a valid TikTok link.`);
        }
        
        m.reply("```loading.....*.```");
    
        const tiktokApiUrl = `https://api.bk9.dev/download/tiktok?url=${encodeURIComponent(text)}`;

        fetch(tiktokApiUrl)
            .then(response => response.json())
            .then(data => {
                if (!data.status || !data.BK9 || !data.BK9.BK9) {
                    return reply('Failed to get a valid download link from the API.');
                }
                
                const videoUrl = data.BK9.BK9;
                
                bad.sendMessage(m.chat, {
                    caption: "`success.....²⁵`",
                    video: { url: videoUrl }
                }, { quoted: m });
            })
            .catch(err => {
                console.error(err);
                reply("An error occurred while fetching the video. Please check your network or try a different link.");
            });
    }
   break;
case 'igdl':
case 'Instagram':
case 'ig': {
  if (!text) return reply(` *Instagram Downloader*\n\nExample:\n.ig <instagram_post/reel_url>`);

  try {
    const res = await fetch(` https://api.bk9.dev/download/instagram?url=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (json.status !== 200 || !json.result?.status) {
      return reply('Failed to fetch Instagram media. Make sure the link is valid and public.');
    }

    const media = json.result.data[0];

    await bad.sendMessage(m.chat, {
      video: { url: media.url },
      caption: `✅ *Instagram Video Downloaded*\n\n🌐 URL: ${text}`,
    }, { quoted: m });

  } catch (err) {
    console.error('[IG ERROR]', err);
    reply(' An error occurred while downloading the Instagram video.');
  }
  break;
}
case 'tr': {
  if (!m.quoted || !m.quoted.text) return reply('Reply to a message you want translated.');

  const query = encodeURIComponent(m.quoted.text.trim());
  const targetLang = 'en';
  const api = `https://fastrestapis.fasturl.cloud/tool/translate?text=${query}&target=${targetLang}`;

  try {
    const res = await fetch(api);
    const json = await res.json();

    if (json.status !== 200) return reply(' Failed to translate.');

    const result = `*Translated to English*\n\n📝 *Original:* ${m.quoted.text.trim()}\n📘 *Result:* ${json.result.translatedText}`;
    reply(result);
  } catch (err) {
    console.error('[TRANSLATE ERROR]', err);
    reply(' Error translating message.');
  }
  break;
}
case 'git':
case 'gitclone': {
  if (!args[0]) return bad.reply(m.chat, `Where is the link?\nExample:\n${prefix + command} https://github.com/user/repo`, m);
  if (!isUrl(args[0]) || !args[0].includes('github.com')) return bad.reply(m.chat, `✖️ Invalid GitHub link!`, m);

  let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/([^\/\s]+)(?:\.git)?/i;
  let match = args[0].match(regex1);
  if (!match) return bad.reply(m.chat, `✖️ Unable to parse GitHub URL.\nMake sure it's like:\nhttps://github.com/user/repo`, m);

  let [, user, repo] = match;
  let url = `https://api.github.com/repos/${user}/${repo}/zipball`;

  try {
    let response = await fetch(url, { method: 'HEAD' });
    let contentDisposition = response.headers.get('content-disposition');
    let filename = contentDisposition?.match(/attachment; filename="?(.+?)"?$/)?.[1] || `${repo}.zip`;

    await bad.reply(m.chat, `「 *${botname} GitCloner* 」\n Repo: *${user}/${repo}*\n📦 File: *${filename}*\n Sending zipped repo...\n> powered by ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥`, m);

    await bad.sendMessage(m.chat, {
      document: { url },
      fileName: filename,
      mimetype: 'application/zip'
    }, { quoted: m });
  } catch (err) {
    console.error(err);
    bad.reply(m.chat, ` Failed to fetch GitHub repo.\nMaybe it’s private or doesn’t exist.`, m);
  }
}
break;
case 'download':
case 'save':
case 'svt': {
  if (!isCreator) return reply("```for Owner only```.");
  const quotedMessage = m.msg.contextInfo.quotedMessage;
  if (quotedMessage) {
    if (quotedMessage.imageMessage) {
      let imageCaption = quotedMessage.imageMessage.caption;
      let imageUrl = await bad.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
      bad.sendMessage(botNumber, { image: { url: imageUrl }, caption: imageCaption });
    }
    if (quotedMessage.videoMessage) {
      let videoCaption = quotedMessage.videoMessage.caption;
      let videoUrl = await bad.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
      bad.sendMessage(botNumber, { video: { url: videoUrl }, caption: videoCaption });
    }
  }
}
break;

case 'elon': {
    try {
        if (!text) return reply("❌ Provide text!\n\nExample: .elon I am launching a rocket 🚀");

        let apiUrl = `https://api.nexoracle.com/xtweets/elon-musk?apikey=58abc73ae34c34784e&text=${encodeURIComponent(text)}`;
        let res = await fetch(apiUrl);
        if (!res.ok) throw new Error("API failed");

        let arrayBuffer = await res.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);

        await bad.sendMessage(m.chat, {
            image: buffer,
            caption: `🚀 Elon Musk tweeted:\n\n${text}`
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        reply("⚠️ Error generating Elon tweet.");
    }
}
break;

case 'zuck': {
    try {
        if (!text) return reply("❌ Provide text!\n\nExample: .zuck Hello world 🌍");

        let apiUrl = `https://api.nexoracle.com/xtweets/mark-zuckerberg?apikey=58abc73ae34c34784e&text=${encodeURIComponent(text)}`;
        let res = await fetch(apiUrl);
        if (!res.ok) throw new Error("API failed");

        let arrayBuffer = await res.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);

        await bad.sendMessage(m.chat, {
            image: buffer,
            caption: `🧑‍💻 Mark Zuckerberg tweeted:\n\n${text}`
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        reply("⚠️ Error generating Zuckerberg tweet.");
    }
}
break;

case 'github':
case 'gitdata': {
    if (!text) return reply(`❌ Usage: .github <username>\n\nExample: .github nextoracle`);

    try {
        const res = await fetch(`https://api.nexoracle.com/stalking/github-user?apikey=58abc73ae34c34784e&user=${encodeURIComponent(text)}`);
        const data = await res.json();

        if (data.status !== 200) return reply("❌ User not found or API error.");

        const user = data.result;

        let info = `👨‍💻 *GitHub User Info*\n\n`;
        info += `🔹 Username: ${user.login}\n`;
        info += `🆔 ID: ${user.id}\n`;
        info += `📛 Name: ${user.name || "N/A"}\n`;
        info += `🏢 Company: ${user.company || "N/A"}\n`;
        info += `🌍 Location: ${user.location || "N/A"}\n`;
        info += `📝 Bio: ${user.bio || "N/A"}\n\n`;
        info += `📦 Public Repos: ${user.public_repos}\n`;
        info += `📌 Public Gists: ${user.public_gists}\n`;
        info += `👥 Followers: ${user.followers}\n`;
        info += `👤 Following: ${user.following}\n\n`;
        info += `📅 Created: ${user.created_at}\n`;
        info += `⏳ Updated: ${user.updated_at}\n\n`;
        info += `🔗 Profile: ${user.html_url}\n`;
        if (user.blog) info += `🌐 Blog: ${user.blog}\n`;
        if (user.email) info += `📧 Email: ${user.email}\n`;

        await bad.sendMessage(m.chat, {
            image: { url: user.avatar_url },
            caption: info
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        reply("❌ Failed to fetch GitHub data.");
    }
}
break;

case 'tourl': {    

    let q = m.quoted ? m.quoted : m;
    if (!q || !q.download) return reply(`Reply to an Image or Video with command ${prefix + command}`);
    
    let mime = q.mimetype || '';
    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime)) {
        return reply('Only images or MP4 videos are supported!');
    }

    let media;
    try {
        media = await q.download();
    } catch (error) {
        return reply('Failed to download media!');
    }

    const uploadImage = require('./allfunc/Data6');
    const uploadFile = require('./allfunc/Data7');
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);
    let link;
    try {
        link = await (isTele ? uploadImage : uploadFile)(media);
    } catch (error) {
        return reply('Failed to upload media!');
    }

    bad.sendMessage(m.chat, {
        text: `[\`\`\`DONE BY ${botname} MD]\`\`\` \n[${link}]`
    }, { quoted: m });
}
break;
case 'setppbot': {
  if (!isOwner) return reply('This command is only for the owner.');
  if (!quoted || !/image/.test(mime)) return reply(`Reply to an image to set as bot profile picture.`);
  let media = await quoted.download();
  await bad.updateProfilePicture(botNumber, media);
  reply('〔 POWERED BY ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥 〕\n Profile picture updated.');
}
break;
case 'react-ch': 
case 'reactch': {
    if (!isPremium) return reply(`Sorry, only premium users can use this command`);

    if (!args[0]) {
        return reply("Usage:\n.reactch https://whatsapp.com/channel/abcd 𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃");
    }

    if (!args[0].startsWith("https://whatsapp.com/channel/")) {
        return reply("This channel link is invalid.");
    }

    const hurufGaya = {
        a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
        h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
        o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
        v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
        '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
        '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
    };

    const emojiInput = args.slice(1).join(' ');
    const emoji = emojiInput.split('').map(c => {
        if (c === ' ') return '―';
        const lower = c.toLowerCase();
        return hurufGaya[lower] || c;
    }).join('');

    try {
        const link = args[0];
        const channelId = link.split('/')[4];
        const messageId = link.split('/')[5];

        const res = await bad.newsletterMetadata("invite", channelId);
        await bad.newsletterReactMessage(res.id, messageId, emoji);

        return reply(` Successfully sent reaction *${emoji}* in channel *${res.name}*.`);
    } catch (e) {
        console.error(e);
        return reply(" Failed to send the reaction. Please check the link and try again.");
    }
};
break;
case 'addowner': case 'addown': {
    if (!isCreator) return m.reply("Owner only.");
    if (!args[0]) return m.reply(`Usage: ${command} 234xxx`);

    let number = qtext.replace(/[^0-9]/g, '');
    let checkNumber = await bad.onWhatsApp(number + "@s.whatsapp.net");
    if (!checkNumber.length) return m.reply("Invalid number!");

    owner.push(number);
    Premium.push(number);
    fs.writeFileSync('./allfunc/owner.json', JSON.stringify(owner));
    fs.writeFileSync('./allfunc/premium.json', JSON.stringify(Premium));

    m.reply("Owner added successfully.");
}
break;

case 'delowner': case 'delown': {
    if (!isCreator) return m.reply("Owner only.");
    if (!args[0]) return m.reply(`Usage: ${command} 234xxx`);

    let number = qtext.replace(/[^0-9]/g, '');
    owner.splice(owner.indexOf(number), 1);
    Premium.splice(Premium.indexOf(number), 1);

    fs.writeFileSync('./allfunc/owner.json', JSON.stringify(owner));
    fs.writeFileSync('./allfunc/premium.json', JSON.stringify(Premium));

    m.reply("Owner removed successfully.");
}
break;

case 'addpremium': case 'addprem': {
    if (!isCreator) return m.reply("Owner only!");
    if (!args[0]) return m.reply(`Usage: ${prefix + command} 234xxx`);

    let number = qtext.split("|")[0].replace(/[^0-9]/g, '');
    let ceknum = await bad.onWhatsApp(number + "@s.whatsapp.net");
    if (!ceknum.length) return m.reply("Invalid number!");

    Premium.push(number);
    fs.writeFileSync('./allfunc/premium.json', JSON.stringify(Premium));

    m.reply("Success! User added to premium.");
}
break;

case 'delpremium': case 'delprem': {
    if (!isCreator) return m.reply("Owner only!");
    if (!args[0]) return m.reply(`Usage: ${prefix + command} 234xxx`);

    let number = qtext.split("|")[0].replace(/[^0-9]/g, '');
    let indexPremium = Premium.indexOf(number);

    if (indexPremium !== -1) {
        Premium.splice(indexPremium, 1);
        fs.writeFileSync('./allfunc/premium.json', JSON.stringify(Premium));
        m.reply("Success! User removed from premium.");
    } else {
        m.reply("User is not in the premium list.");
    }
}
break;
case 'runtime': case 'alive': { 
         reply(`❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥 𝗜𝗦 𝗢𝗡𝗟𝗜𝗡𝗘 \n 𝗦𝗣𝗘𝗘𝗗\n : ${runtime(process.uptime())} `); 
}
break
 case 'ping': case 'speed': { 

let timestamp = speed()
let latensi = speed() - timestamp

         reply (`\`\`\`❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥\`\`\`\n\◈   𝗦𝗣𝗘𝗘𝗗   : ${latensi.toFixed(4)} 𝐌𝐒`); 
}
break;
case 'public': {
    if (!isCreator) return m.reply("Owner only.");
    bad.public = true;
    m.reply("❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥 has been set to public mode.");
}
break;

case 'private': case 'self': {
    if (!isCreator) return m.reply("Owner only.");
    bad.public = false;
    m.reply("❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥 has been set to private mode.");
}
break;

case 'spotify': {
  if (!text) return reply('❌ Provide a Spotify track URL!\n\nExample: .spotify https://open.spotify.com/track/xxxxx');
  try {
    reply('🎵 Downloading from Spotify...');
    const api = `https://api.giftedtech.my.id/api/download/spotify?apikey=gifted&url=${encodeURIComponent(text)}`;
    const res = await fetch(api);
    const data = await res.json();
    if (!data.success || !data.result) return reply('❌ Failed to download. Make sure the link is valid.');
    const { title, artist, image, download } = data.result;
    await bad.sendMessage(m.chat, { image: { url: image }, caption: `🎵 *${title}*\n👤 Artist: ${artist}\n\n⏳ Sending audio...` }, { quoted: m });
    await bad.sendMessage(m.chat, { audio: { url: download }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });
  } catch (e) {
    console.error('Spotify error:', e);
    reply('❌ Error downloading from Spotify. Try again later.');
  }
  break;
}

case 'removebg': {
  if (!m.quoted || !/image/.test(mime)) return reply('❌ Reply to an image to remove its background!');
  try {
    reply('🎨 Removing background...');
    const media = await bad.downloadAndSaveMediaMessage(m.quoted);
    const imageBuffer = fs.readFileSync(media);
    const base64Image = imageBuffer.toString('base64');
    const api = `https://api.giftedtech.my.id/api/tools/removebg?apikey=gifted&url=data:image/jpeg;base64,${base64Image}`;
    const res = await fetch(api);
    const data = await res.json();
    if (!data.success || !data.result) return reply('❌ Failed to remove background.');
    await bad.sendMessage(m.chat, { image: { url: data.result }, caption: '✅ Background removed!' }, { quoted: m });
    fs.unlinkSync(media);
  } catch (e) {
    console.error('RemoveBG error:', e);
    reply('❌ Failed to remove background. Try another image.');
  }
  break;
}

case 'ai': {
  if (!text) return reply('❌ Ask me anything!\n\nExample: .ai What is photosynthesis?');
  try {
    reply('🤖 Thinking...');
    const api = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`;
    const res = await fetch(api);
    const data = await res.json();
    if (!data.success || !data.result) return reply('❌ No response from AI.');
    reply(`🤖 *AI Response:*\n\n${data.result.prompt}`);
  } catch (e) {
    console.error('AI error:', e);
    reply('❌ AI service unavailable. Try again later.');
  }
  break;
}

case 'lyrics': {
  if (!text) return reply('❌ Provide a song name!\n\nExample: .lyrics Blinding Lights');
  try {
    reply('🎵 Searching lyrics...');
    const api = `https://api.popcat.xyz/lyrics?song=${encodeURIComponent(text)}`;
    const res = await fetch(api);
    const data = await res.json();
    if (!data.lyrics) return reply('❌ Lyrics not found!');
    const response = `🎵 *${data.title}*\n👤 ${data.artist}\n\n${data.lyrics}`;
    await bad.sendMessage(m.chat, { image: { url: data.image }, caption: response }, { quoted: m });
  } catch (e) {
    console.error('Lyrics error:', e);
    reply('❌ Failed to fetch lyrics.');
  }
  break;
}

case 'weather': {
  if (!text) return reply('❌ Provide a city name!\n\nExample: .weather London');
  try {
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(text)}&appid=060a6bcfa19809c2cd4d97a212b19273&units=metric`;
    const res = await fetch(api);
    const data = await res.json();
    if (data.cod !== 200) return reply('❌ City not found!');
    const weather = `\n🌤️ *Weather in ${data.name}, ${data.sys.country}*\n\n🌡️ Temperature: ${data.main.temp}°C\n🌡️ Feels Like: ${data.main.feels_like}°C\n💧 Humidity: ${data.main.humidity}%\n☁️ Condition: ${data.weather[0].description}\n💨 Wind Speed: ${data.wind.speed} m/s\n`;
    reply(weather);
  } catch (e) {
    console.error('Weather error:', e);
    reply('❌ Failed to get weather data.');
  }
  break;
}

case 'meme': {
  try {
    const api = 'https://meme-api.com/gimme';
    const res = await fetch(api);
    const data = await res.json();
    await bad.sendMessage(m.chat, { image: { url: data.url }, caption: `😂 *${data.title}*\n👤 by r/${data.subreddit}` }, { quoted: m });
  } catch (e) {
    console.error('Meme error:', e);
    reply('❌ Failed to fetch meme. Try again!');
  }
  break;
}

case 'twitter':
case 'x': {
  if (!text) return reply('❌ Provide a Twitter/X URL!\n\nExample: .twitter https://twitter.com/user/status/xxxxx');
  try {
    reply('🐦 Downloading from Twitter...');
    const api = `https://api.giftedtech.my.id/api/download/twitterdl?apikey=gifted&url=${encodeURIComponent(text)}`;
    const res = await fetch(api);
    const data = await res.json();
    if (!data.success || !data.result || !data.result.downloads || data.result.downloads.length === 0) return reply('❌ Failed to download. Make sure the link is valid.');
    const videoUrl = data.result.downloads[0].url;
    await bad.sendMessage(m.chat, { video: { url: videoUrl }, caption: '✅ Downloaded from Twitter/X' }, { quoted: m });
  } catch (e) {
    console.error('Twitter error:', e);
    reply('❌ Failed to download from Twitter. Try again later.');
  }
  break;
}

case 'emojimix': {
  if (!text || !text.includes('+')) return reply('❌ Mix two emojis!\n\nExample: .emojimix 😊+😎');
  try {
    const [emoji1, emoji2] = text.split('+').map(e => e.trim());
    if (!emoji1 || !emoji2) return reply('❌ Format: .emojimix 😊+😎');
    const api = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
    const res = await fetch(api);
    const data = await res.json();
    if (!data.results || !data.results[0]) return reply('❌ Cannot mix these emojis. Try different ones!');
    const stickerUrl = data.results[0].url;
    await bad.sendImageAsSticker(m.chat, stickerUrl, m, { packname: global.packname, author: global.author });
  } catch (e) {
    console.error('Emojimix error:', e);
    reply('❌ Failed to mix emojis. Try again!');
  }
  break;
}

case 'calculator':
case 'calc': {
  if (!text) return reply('🧮 Usage: .calculator 2+2\n\nSupports: +, -, *, /, sqrt(), sin(), cos()');
  try {
    const expression = text.replace(/sqrt/g, 'Math.sqrt').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos');
    const result = eval(expression);
    reply(`🧮 *Calculator*\n\n${text} = ${result}`);
  } catch (e) {
    reply('❌ Invalid expression!');
  }
  break;
}

case 'flipcoin':
case 'coin': {
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  reply(`🪙 *Coin Flip*\n\nResult: **${result}**`);
  break;
}

case 'dice':
case 'roll': {
  const result = Math.floor(Math.random() * 6) + 1;
  const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][result - 1];
  reply(`🎲 *Dice Roll*\n\n${diceEmoji} You rolled: **${result}**`);
  break;
}

case 'reverse': {
  if (!text) return reply('Usage: .reverse hello world');
  const reversed = text.split('').reverse().join('');
  reply(`🔄 *Reversed Text*\n\nOriginal: ${text}\nReversed: ${reversed}`);
  break;
}

case 'uppercase':
case 'upper': {
  if (!text) return reply('Usage: .uppercase hello');
  reply(text.toUpperCase());
  break;
}

case 'lowercase':
case 'lower': {
  if (!text) return reply('Usage: .lowercase HELLO');
  reply(text.toLowerCase());
  break;
}

case 'count': {
  if (!text) return reply('Usage: .count your text here');
  const chars = text.length;
  const words = text.trim().split(/\s+/).length;
  reply(`📊 *Text Counter*\n\nCharacters: ${chars}\nWords: ${words}`);
  break;
}

case 'ship': {
  if (!m.isGroup) return reply('Group command only!');
  const members = participants.map(p => p.id);
  const person1 = members[Math.floor(Math.random() * members.length)];
  const person2 = members[Math.floor(Math.random() * members.length)];
  const percent = Math.floor(Math.random() * 100);
  reply(`💘 *Ship Match*\n\n@${person1.split('@')[0]} ❤️ @${person2.split('@')[0]}\n\nCompatibility: ${percent}%`);
  break;
}

case 'groupinfo':
case 'gcinfo': {
  if (!m.isGroup) return reply('Group command only!');
  const admins = participants.filter(p => p.admin).length;
  const created = new Date(groupMetadata.creation * 1000).toDateString();
  const info = `\n📊 *Group Information*\n\n📌 Name: ${groupName}\n👥 Members: ${participants.length}\n👑 Admins: ${admins}\n📅 Created: ${created}\n📝 Description: ${groupMetadata.desc || 'None'}\n`;
  reply(info);
  break;
}

case 'quote':
case 'randomquote': {
  const quotes = ["The only way to do great work is to love what you do. - Steve Jobs", "Life is what happens when you're busy making other plans. - John Lennon", "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt", "It is during our darkest moments that we must focus to see the light. - Aristotle", "Believe you can and you're halfway there. - Theodore Roosevelt", "The only impossible journey is the one you never begin. - Tony Robbins", "Life is 10% what happens to you and 90% how you react to it. - Charles R. Swindoll", "The way to get started is to quit talking and begin doing. - Walt Disney"];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  reply(`💭 *Random Quote*\n\n${randomQuote}`);
  break;
}

case 'joke':
case 'randomjoke': {
  const jokes = ["Why don't scientists trust atoms? Because they make up everything!", "What do you call a bear with no teeth? A gummy bear!", "Why did the scarecrow win an award? He was outstanding in his field!", "What do you call fake spaghetti? An impasta!", "Why did the bicycle fall over? It was two tired!", "What do you call a can opener that doesn't work? A can't opener!", "I'm reading a book about anti-gravity. It's impossible to put down!", "Why don't eggs tell jokes? They'd crack each other up!"];
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  reply(`😂 *Random Joke*\n\n${randomJoke}`);
  break;
}

case 'fact':
case 'randomfact': {
  const facts = ["Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that's still edible.", "Octopuses have three hearts and blue blood.", "The shortest war in history lasted 38 minutes between Britain and Zanzibar in 1896.", "A day on Venus is longer than a year on Venus.", "Bananas are berries, but strawberries aren't.", "The average person walks the equivalent of three times around the world in a lifetime.", "Your brain uses 20% of the body's energy despite being only 2% of its mass.", "There are more stars in the universe than grains of sand on all Earth's beaches."];
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  reply(`🧠 *Random Fact*\n\n${randomFact}`);
  break;
}

case 'timer':
case 'countdown': {
  if (!text) return reply('Usage: .timer 60 (seconds)');
  const seconds = parseInt(text);
  if (isNaN(seconds) || seconds <= 0) return reply('❌ Invalid time!');
  reply(`⏰ Timer set for ${seconds} seconds!`);
  setTimeout(() => {
    bad.sendMessage(m.chat, { text: `⏰ *TIME'S UP!*\n\n${seconds} seconds have passed!`, mentions: [m.sender] });
  }, seconds * 1000);
  break;
}

case 'poll': {
  if (!m.isGroup) return reply('Group command only!');
  if (!text || !text.includes('|')) return reply('Usage: .poll Question|Option1|Option2|Option3');
  const parts = text.split('|').map(p => p.trim());
  if (parts.length < 3) return reply('Need at least 2 options!');
  const question = parts[0];
  const options = parts.slice(1);
  let pollText = `📊 *POLL*\n\n${question}\n\n`;
  options.forEach((opt, i) => { pollText += `${i + 1}. ${opt}\n`; });
  reply(pollText);
  break;
}

case 'gpt': {
  if (!text) return reply('❌ Ask me anything!\n\nExample: .gpt what is javascript');
  
  try {
    const api = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`;
    const res = await fetch(api);
    const data = await res.json();
    
    if (!data.success || !data.result) return reply('❌ No response from AI.');
    
    reply(data.result.prompt);
  } catch (e) {
    reply('❌ AI service unavailable. Try again later.');
  }
  break;
}

default:
if (budy.startsWith('<')) {
if (!isCreator) return;
function Return(sul) {
sat = JSON.stringify(sul, null, 2)
bang = util.format(sat)
if (sat == undefined) {
bang = util.format(sul)}
return m.reply(bang)}
try {
m.reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
} catch (e) {
m.reply(String(e))}}
if (budy.startsWith('>')) {
if (!isCreator) return;
try {
let evaled = await eval(budy.slice(2))
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await m.reply(evaled)
} catch (err) {
await m.reply(String(err))
}
}
if (budy.startsWith('$')) {
if (!isCreator) return;
require("child_process").exec(budy.slice(2), (err, stdout) => {
if (err) return m.reply(`${err}`)
if (stdout) return m.reply(stdout)
})
}
}
} catch (err) {
console.log(require("util").format(err));
}
}
let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
require('fs').unwatchFile(file)
console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
delete require.cache[file]
require(file)
})