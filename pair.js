// Fixed Pair For Better Uptime By EmmyHenz
const {
    default: makeWASocket,
    jidDecode,
    DisconnectReason,
    PHONENUMBER_MCC,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    Browsers,
    getContentType,
    proto,
    jidNormalizedUser,
    downloadContentFromMessage,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    delay
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const _ = require('lodash');
const { Boom } = require('@hapi/boom');
const PhoneNumber = require('awesome-phonenumber');
let phoneNumber = "2349125042727";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
const readline = require("readline");
const pino = require('pino');
const FileType = require('file-type');
const fs = require('fs');
const path = require('path');
let themeemoji = "❤️‍🔥";
const chalk = require('chalk');
const { writeExif, imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, reSize } = require('./lib/myfunc');
const { handleMessages, handleGroupParticipantUpdate, handleStatus, handleCalls } = require('./main');
const { setDefaultBioOnStartup } = require('./commands/setbotbio');

const rl = readline.createInterface({input: process.stdin, output: process.stdout});
let store = makeInMemoryStore({logger: pino().child({level: 'silent', stream: 'store'})});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Global retry counter and max retries
const retryCountMap = {};
const MAX_RETRIES = 3;

// Connection timeout settings
const CONNECTION_TIMEOUT = 30000;
const KEEP_ALIVE_INTERVAL = 20000;
const MAX_KEEP_ALIVE_FAILURES = 3;

const idch = [
    "120363317747980810@newsletter",
    "120363410694173688@newsletter"
];

// Process stability
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

// Memory monitoring
setInterval(() => {
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    if (memMB > 300) {
        console.log(`High memory usage: ${memMB}MB`);
        if (global.gc) global.gc();
    }
}, 30 * 60 * 1000);

function cleanSessionFiles(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            if (file !== 'creds.json' && !file.includes('pairing')) {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            }
        });
        console.log(chalk.green(`Session cleaned (credentials preserved) for ${path.basename(folderPath)}`));
    }
}

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            fs.lstatSync(curPath).isDirectory() ? deleteFolderRecursive(curPath) : fs.unlinkSync(curPath);
        });
        fs.rmdirSync(folderPath);
    }
}

function hasValidCredentials(sessionPath) {
    const credsPath = path.join(sessionPath, 'creds.json');
    if (!fs.existsSync(credsPath)) {
        return false;
    }
    
    try {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        return creds && creds.registered === true && creds.me && creds.me.id;
    } catch (error) {
        console.log(chalk.red(`Error reading credentials: ${error.message}`));
        return false;
    }
}

async function startpairing(kingbadboiNumber) {
    const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;
    
    // Check if valid credentials exist
    if (hasValidCredentials(sessionPath)) {
        console.log(chalk.blue(`📱 Valid credentials found for ${kingbadboiNumber}, reconnecting...`));
    } else {
        console.log(chalk.yellow(`🔗 No valid credentials for ${kingbadboiNumber}, starting pairing process...`));
    }
    
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    // CRITICAL FIX #1: Proper auth state setup
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    // CRITICAL FIX #2: Create msgRetryCounterCache before socket
    const msgRetryCounterCache = new NodeCache({
        stdTTL: 60 * 60,
        useClones: false
    });

    // CRITICAL FIX #3: Proper auth configuration with makeCacheableSignalKeyStore
    const bad = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !pairingCode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
        },
        browser: Browsers.ubuntu("Chrome"),
        version,
        getMessage: async key => {
            const jid = jidNormalizedUser(key.remoteJid);
            const msg = await store.loadMessage(jid, key.id);
            return msg?.message || '';
        },
        connectTimeoutMs: CONNECTION_TIMEOUT,
        keepAliveIntervalMs: KEEP_ALIVE_INTERVAL,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        msgRetryCounterCache,
        defaultQueryTimeoutMs: 60000
    });
    
    store.bind(bad.ev);

    // CRITICAL FIX #4: Pairing code logic with proper timing and validation
    if (pairingCode && !state.creds.registered) {
        if (useMobile) {
            throw new Error('Cannot use pairing code with mobile API');
        }

        // Clean phone number
        let cleanPhone = kingbadboiNumber.replace(/[^0-9]/g, '');
        
        // Validate phone number
        const pn = PhoneNumber('+' + cleanPhone);
        if (!pn.isValid()) {
            console.log(chalk.red('Invalid phone number format'));
            process.exit(1);
        }

        // CRITICAL FIX #5: Proper delay before requesting code (3 seconds like working code)
        setTimeout(async () => {
            try {
                let code = await bad.requestPairingCode(cleanPhone);
                code = code?.match(/.{1,4}/g)?.join("-") || code;

                console.log(chalk.bgGreen(chalk.black(`Pairing Code for ${cleanPhone}: `)), chalk.white(code));
                
                // Save pairing code
                fs.writeFileSync(
                    './kingbadboitimewisher/pairing/pairing.json',
                    JSON.stringify({"code": code, "phone": cleanPhone, "timestamp": Date.now()}, null, 2),
                    'utf8'
                );
                
                console.log(chalk.yellow(`\n📱 Enter this code in WhatsApp:\n1. Open WhatsApp\n2. Settings > Linked Devices\n3. Link a Device\n4. Enter code: ${code}\n`));
            } catch (error) {
                console.error(chalk.red('Error requesting pairing code:'), error.message);
            }
        }, 3000); // 3 second delay is critical
    }

    setupEventHandlers(bad, saveCreds, kingbadboiNumber);
}

function setupEventHandlers(bad, saveCreds, kingbadboiNumber) {
    let lastMessageReceived = Date.now();
    let connectionValidator;
    let keepAliveFailures = 0;
    let keepAliveInterval;
    
    const startKeepAliveMonitor = () => {
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        
        keepAliveInterval = setInterval(async () => {
            try {
                await bad.sendPresenceUpdate('unavailable');
                keepAliveFailures = 0;
            } catch (error) {
                keepAliveFailures++;
                console.log(chalk.yellow(`Keep-alive attempt ${keepAliveFailures}/${MAX_KEEP_ALIVE_FAILURES} failed`));
                
                if (keepAliveFailures >= MAX_KEEP_ALIVE_FAILURES) {
                    console.log(chalk.red('Max keep-alive failures reached, forcing reconnect'));
                    clearInterval(keepAliveInterval);
                    bad.end(new Error('Keep-alive failed'));
                }
            }
        }, KEEP_ALIVE_INTERVAL);
    };
    
    const startConnectionValidator = () => {
        if (connectionValidator) clearInterval(connectionValidator);
        
        connectionValidator = setInterval(async () => {
            const timeSinceLastMessage = Date.now() - lastMessageReceived;
            
            if (timeSinceLastMessage > 20 * 60 * 1000) {
                try {
                    await bad.sendPresenceUpdate('composing');
                    await sleep(1000);
                    await bad.sendPresenceUpdate('available');
                    console.log('Connection health check passed');
                } catch (error) {
                    console.log('Connection health check failed, reconnecting...');
                    bad.end(new Error('Health check failed'));
                }
            }
        }, 10 * 60 * 1000);
    };
    
    bad.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && `${decode.user}@${decode.server}` || jid;
        } else {
            return jid;
        }
    };
    
    bad.ev.on('messages.upsert', async chatUpdate => {
        lastMessageReceived = Date.now();

        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
            
            const jid = mek.key.remoteJid;
            const myNewsletter = "120363410694173688@newsletter"; 
            
            if (jid && jid === myNewsletter) {
                try {
                    const { emojis } = require('./autoreact');
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    const messageId = mek.newsletterServerId;

                    if (messageId) {
                        let retries = 3;
                        while (retries-- > 0) {
                            try {
                                await bad.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
                                console.log(`✅ Reacted to newsletter with ${randomEmoji}`);
                                break;
                            } catch (err) {
                                console.warn(`❌ Reaction attempt failed (${3 - retries}/3):`, err.message);
                                await sleep(1500);
                            }
                        }
                    }
                } catch (error) {
                    console.error('⚠️ Newsletter reaction handler failed:', error.message);
                }
                return;
            }

            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(bad, chatUpdate);
                return;
            }

            if (!bad.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
            
            // Clear retry cache to prevent memory issues
            if (bad.msgRetryCounterCache) {
                bad.msgRetryCounterCache.clear();
            }

            try {
                await handleMessages(bad, chatUpdate, true);
            } catch (err) {
                console.error("Error in handleMessages:", err);
                if (mek.key && mek.key.remoteJid) {
                    await bad.sendMessage(mek.key.remoteJid, { 
                        text: '❌ An error occurred while processing your message.',
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363317747980810@newsletter',
                                newsletterName: '𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕1',
                                serverMessageId: -1
                            }
                        }
                    }).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Error in messages.upsert:", err);
        }
    });

    bad.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(bad, update);
    });

    bad.ev.on('status.update', async (status) => {
        await handleStatus(bad, status);
    });

    bad.ev.on('messages.reaction', async (status) => {
        await handleStatus(bad, status);
    });
    
    bad.ev.on('call', async (callUpdate) => {
        await handleCalls(bad, callUpdate);
    });

    bad.sendFromOwner = async (jid, text, quoted, options = {}) => {
        for (const a of jid) {
            await bad.sendMessage(a + '@s.whatsapp.net', { text, ...options }, { quoted });
        }
    };
    
    bad.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options);
        } else {
            buffer = await imageToWebp(buff);
        }
        await bad.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
            .then(response => {
                fs.unlinkSync(buffer);
                return response;
            });
    };

    bad.public = true;
    bad.sendText = (jid, text, quoted = '', options) => bad.sendMessage(jid, { text: text, ...options }, { quoted });
    
    bad.getFile = async (PATH, save) => {
        let res;
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        };
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext);
        if (data && save) fs.promises.writeFile(filename, data);
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        };
    };
    
    bad.ments = (teks = "") => {
        return teks.match("@")
            ? [...teks.matchAll(/@([0-9]{5,16}|0)/g)].map(
                (v) => v[1] + "@s.whatsapp.net"
            )
            : [];
    };
    
    bad.sendTextWithMentions = async (jid, text, quoted, options = {}) => bad.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted });

    bad.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        let type = await FileType.fromBuffer(buffer);
        let trueFileName = attachExtension ? ('./sticker/' + filename + '.' + type.ext) : './sticker/' + filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    bad.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };
    
    // CRITICAL FIX #6: Proper creds.update handler
    bad.ev.on('creds.update', saveCreds);
    
    // Enhanced connection handler
    bad.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;

        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.yellow(`❌ Connection closed for ${kingbadboiNumber}. Reason: ${reason}`));

            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
            }
            if (connectionValidator) {
                clearInterval(connectionValidator);
                connectionValidator = null;
            }

            if (retryCountMap[kingbadboiNumber] === undefined) {
                retryCountMap[kingbadboiNumber] = 0;
            }

            let shouldReconnect = true;
            
            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red.bold(`🚪 Logged out - deleting session`));
                deleteFolderRecursive(sessionPath);
                delete retryCountMap[kingbadboiNumber];
                return;
            }

            if (reason === DisconnectReason.connectionReplaced) {
                console.log(chalk.blue(`🔄 Connection replaced`));
                delete retryCountMap[kingbadboiNumber];
                return;
            }

            retryCountMap[kingbadboiNumber]++;

            if (retryCountMap[kingbadboiNumber] >= MAX_RETRIES) {
                console.error(chalk.red.bold(`❌ Max retries exceeded for ${kingbadboiNumber}`));
                deleteFolderRecursive(sessionPath);
                delete retryCountMap[kingbadboiNumber];
                return;
            }

            // Handle reconnection based on reason
            let reconnectDelay = 2000;
            
            switch (reason) {
                case DisconnectReason.badSession:
                    console.log(chalk.red(`❌ Bad session, cleaning...`));
                    cleanSessionFiles(sessionPath);
                    reconnectDelay = 2000;
                    break;
                case DisconnectReason.timedOut:
                    console.log(chalk.yellow(`⏰ Timed out`));
                    reconnectDelay = 1000;
                    break;
                case 403:
                case 401:
                    console.log(chalk.red(`🚫 Authentication error ${reason}`));
                    cleanSessionFiles(sessionPath);
                    reconnectDelay = 3000;
                    break;
                case 429:
                    reconnectDelay = 10000 + Math.random() * 15000;
                    console.log(chalk.red(`⏰ Rate limited, waiting ${Math.round(reconnectDelay/1000)}s`));
                    break;
                default:
                    reconnectDelay = 2000;
            }

            await sleep(reconnectDelay);
            startpairing(kingbadboiNumber);
            
        } else if (connection === "open") {
            delete retryCountMap[kingbadboiNumber];
            
            startKeepAliveMonitor();
            startConnectionValidator();
            
            console.log(chalk.bgBlue(`✅ ${kingbadboiNumber} is now ONLINE!`));
            
            try {
                await bad.newsletterFollow("120363317747980810@newsletter");
                await bad.newsletterFollow("120363410694173688@newsletter");
                await setDefaultBioOnStartup(bad);
            } catch (error) {
                console.error('Error in startup tasks:', error.message);
            }
            
            console.log(chalk.green.bold(`𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕1 is online.`));
            
        } else if (connection === "connecting") {
            console.log(chalk.yellow(`🔄 Connecting ${kingbadboiNumber}...`));
        }
    });
}

module.exports = startpairing;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update= '${__filename}'`));
    delete require.cache[file];
    require(file);
});