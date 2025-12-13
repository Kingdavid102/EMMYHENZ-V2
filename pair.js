 // New Pair For Better Uptime By EmmyHenz
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
delay,
reconnectInterval
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const _ = require('lodash')
const {
Boom
} = require('@hapi/boom')
const PhoneNumber = require('awesome-phonenumber')
let phoneNumber = "2349125042727";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
const readline = require("readline");
const pino = require('pino')
const FileType = require('file-type')
const fs = require('fs')
const path = require('path')
let themeemoji = "❤️‍🔥";
const chalk = require('chalk')
const { writeExif, imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, reSize } = require('./lib/myfunc')
const { handleMessages, handleGroupParticipantUpdate, handleStatus, handleCalls } = require('./main');
const { setDefaultBioOnStartup } = require('./commands/setbotbio');
const rl = readline.createInterface({input: process.stdin,output: process.stdout});
let store = makeInMemoryStore({logger: pino().child({level: 'silent',stream: 'store'})});
let msgRetryCounterCache;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Add global retry counter and max retries here
const retryCountMap = {};
const MAX_RETRIES = 3;

// Connection timeout settings (30 seconds)
const CONNECTION_TIMEOUT = 30000;

// Keep-alive settings
const KEEP_ALIVE_INTERVAL = 20000; // Send keep-alive every 20 seconds
const MAX_KEEP_ALIVE_FAILURES = 3; // Max keep-alive failures before reconnecting

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
            // Preserve creds.json and pairing code files
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
        // Check if credentials are valid and registered
        return creds && creds.registered === true && creds.me && creds.me.id;
    } catch (error) {
        console.log(chalk.red(`Error reading credentials: ${error.message}`));
        return false;
    }
}

async function connectWithCredentials(kingbadboiNumber) {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;
    
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sessionPath);

    const bad = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        version: [2, 3000, 1023223821],
        browser: Browsers.ubuntu("Edge"),
        getMessage: async key => {
            const jid = jidNormalizedUser(key.remoteJid);
            const msg = await store.loadMessage(jid, key.id);
            return msg?.message || '';
        },
        shouldSyncHistoryMessage: msg => {
            console.log(`\x1b[32mLoading Chat [${msg.progress}%]\x1b[39m`);
            return !!msg.syncType;
        },
        // Add connection timeout
        connectTimeoutMs: CONNECTION_TIMEOUT,
        // Keep alive settings
        keepAliveIntervalMs: KEEP_ALIVE_INTERVAL,
        maxIdleTimeMs: 60000, // Close connection after 60 seconds of inactivity
        // Retry settings
        maxRetries: MAX_RETRIES,
        retryDelayMs: 2000, // Wait 2 seconds between retries
        // Mark online by default
        markOnlineOnConnect: true,
        // Generate high quality link preview
        generateHighQualityLinkPreview: true,
        // Sync full history
        syncFullHistory: false,
        // Transaction options
        transactionOpts: {
            maxCommitRetries: 10,
            delayBetweenTriesMs: 3000
        },
        // Message resend options
        msgRetryCounterCache: new NodeCache({
            stdTTL: 60 * 60, // 1 hour
            useClones: false
        }),
        // Default query timeout
        defaultQueryTimeoutMs: 60000,
    }, store)
    
    store.bind(bad.ev);
    
    return { bad, saveCreds };
}

async function startpairing(kingbadboiNumber) {
    const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;
    
    // Check if valid credentials exist
    if (hasValidCredentials(sessionPath)) {
        console.log(chalk.blue(`📱 Valid credentials found for ${kingbadboiNumber}, reconnecting...`));
        const { bad, saveCreds } = await connectWithCredentials(kingbadboiNumber);
        setupEventHandlers(bad, saveCreds, kingbadboiNumber);
        return;
    }
    
    // No valid credentials, start fresh pairing
    console.log(chalk.yellow(`🔗 No valid credentials for ${kingbadboiNumber}, starting pairing process...`));
    
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sessionPath);

    const bad = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        version: [2, 3000, 1023223821],
        browser: Browsers.ubuntu("Edge"),
        getMessage: async key => {
            const jid = jidNormalizedUser(key.remoteJid);
            const msg = await store.loadMessage(jid, key.id);
            return msg?.message || '';
        },
        shouldSyncHistoryMessage: msg => {
            console.log(`\x1b[32mLoading Chat [${msg.progress}%]\x1b[39m`);
            return !!msg.syncType;
        },
        // Add connection timeout
        connectTimeoutMs: CONNECTION_TIMEOUT,
        // Keep alive settings
        keepAliveIntervalMs: KEEP_ALIVE_INTERVAL,
        maxIdleTimeMs: 60000, // Close connection after 60 seconds of inactivity
        // Retry settings
        maxRetries: MAX_RETRIES,
        retryDelayMs: 2000, // Wait 2 seconds between retries
        // Mark online by default
        markOnlineOnConnect: true,
        // Generate high quality link preview
        generateHighQualityLinkPreview: true,
        // Sync full history
        syncFullHistory: false,
        // Transaction options
        transactionOpts: {
            maxCommitRetries: 10,
            delayBetweenTriesMs: 3000
        },
        // Message resend options
        msgRetryCounterCache: new NodeCache({
            stdTTL: 60 * 60, // 1 hour
            useClones: false
        }),
        // Default query timeout
        defaultQueryTimeoutMs: 60000,
    }, store)
    
    store.bind(bad.ev);

    if (pairingCode && !state.creds.registered) {
        if (useMobile) {
            throw new Error('Cannot use pairing code with mobile API');
        }

        let phoneNumber = kingbadboiNumber.replace(/[^0-9]/g, '');
        /*if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        process.exit(0);
        }*/
        setTimeout(async () => {
            let code = await bad.requestPairingCode(phoneNumber, 'EMMYHENZ');
            code = code?.match(/.{1,4}/g)?.join("-") || code;

            fs.writeFile(
                './kingbadboitimewisher/pairing/pairing.json',  // Path of the file where it will be saved
                JSON.stringify({"code": code}, null, 2),  // Transforms the object into a JSON formatted string
                'utf8',
                (err) => {
                    if (err) {
                        console.log(chalk.red(`Error saving pairing code: ${err}`));
                    } else {
                        console.log(chalk.green(`Pairing code saved: ${code}`));
                    }
                }
            );
        }, 1703);
    }

    setupEventHandlers(bad, saveCreds, kingbadboiNumber);
}

function setupEventHandlers(bad, saveCreds, kingbadboiNumber) {
    // Connection health monitoring
    let lastMessageReceived = Date.now();
    let connectionValidator;
    let keepAliveFailures = 0;
    let keepAliveInterval;
    
    // Start keep-alive monitoring when connection is open
    const startKeepAliveMonitor = () => {
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        
        keepAliveInterval = setInterval(async () => {
            try {
                // Send a simple ping to keep connection alive
                await bad.sendPresenceUpdate('unavailable');
                keepAliveFailures = 0; // Reset failure counter on success
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
                await new Promise(resolve => setTimeout(resolve, 1000));
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
        lastMessageReceived = Date.now(); // ADD THIS LINE

        try {

            const mek = chatUpdate.messages[0]

            if (!mek.message) return

            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            
            // ADD YOUR AUTOREACT CODE HERE - RIGHT AFTER MESSAGE PROCESSING
        const jid = mek.key.remoteJid;
        
        // ONLY YOUR NEWSLETTER JID
        const myNewsletter = "120363410694173688@newsletter"; 
        if (jid && jid === myNewsletter) {
            try {
                const { emojis } = require('./autoreact');
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                const messageId = mek.newsletterServerId;

                if (!messageId) {
                    console.warn('No newsletterServerId found in message:', mek);
                    return;
                }

                let retries = 3;
                while (retries-- > 0) {
                    try {
                        await bad.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
                        console.log(`✅ Reacted to YOUR newsletter ${jid} with ${randomEmoji}`);
                        break;
                    } catch (err) {
                        console.warn(`❌ Reaction attempt failed (${3 - retries}/3):`, err.message);
                        await sleep(1500);
                    }
                }
            } catch (error) {
                console.error('⚠️ Newsletter reaction handler failed:', error.message);
            }
            return; // Don't process newsletter messages further
        }
        // END OF AUTOREACT CODE

            if (mek.key && mek.key.remoteJid === 'status@broadcast') {

                await handleStatus(bad, chatUpdate);

                return;

            }

            if (!bad.public && !mek.key.fromMe && chatUpdate.type === 'notify') return

            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

            

            try {

                await handleMessages(bad, chatUpdate, true)

            } catch (err) {

                console.error("Error in handleMessages:", err)

                // Only try to send error message if we have a valid chatId

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

            console.error("Error in messages.upsert:", err)

        }

    })

    

    bad.ev.on('group-participants.update', async (update) => {

        await handleGroupParticipantUpdate(bad, update);

    });

    bad.ev.on('messages.upsert', async (m) => {

        if (m.messages[0].key && m.messages[0].key.remoteJid === 'status@broadcast') {

            await handleStatus(bad, m);

        }

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
    }
    
    bad.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }
        await bad.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
            .then( response => {
                fs.unlinkSync(buffer)
                return response
            })
    }
    //=========================================\\
    bad.public = true
    //=========================================\\
    bad.sendText = (jid, text, quoted = '', options) => bad.sendMessage(jid, { text: text, ...options }, { quoted })
    //=========================================\\
    bad.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        }
    }
    
    bad.ments = (teks = "") => {
        return teks.match("@")
            ? [...teks.matchAll(/@([0-9]{5,16}|0)/g)].map(
                (v) => v[1] + "@s.whatsapp.net"
            )
            : [];
    };
    
    bad.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await bad.getFile(path, true);
        let { res, data: file, filename: pathFile } = type;

        if (res && res.status !== 200 || file.length <= 65536) {
            try {
                throw {
                    json: JSON.parse(file.toString())
                };
            } catch (e) {
                if (e.json) throw e.json;
            }
        }

        let opt = {
            filename
        };

        if (quoted) opt.quoted = quoted;
        if (!type) options.asDocument = true;

        let mtype = '',
            mimetype = type.mime,
            convert;

        if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
        else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
        else if (/video/.test(type.mime)) mtype = 'video';
        else if (/audio/.test(type.mime)) {
            convert = await (ptt ? toPTT : toAudio)(file, type.ext);
            file = convert.data;
            pathFile = convert.filename;
            mtype = 'audio';
            mimetype = 'audio/ogg; codecs=opus';
        } else mtype = 'document';

        if (options.asDocument) mtype = 'document';

        delete options.asSticker;
        delete options.asLocation;
        delete options.asVideo;
        delete options.asDocument;
        delete options.asImage;

        let message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype };
        let m;

        try {
            m = await bad.sendMessage(jid, message, { ...opt, ...options });
        } catch (e) {
            //console.error(e)
            m = null;
        } finally {
            if (!m) m = await bad.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
            file = null;
            return m;
        }
    }

    bad.sendTextWithMentions = async (jid, text, quoted, options = {}) => bad.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
    //=========================================\\

    bad.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        let trueFileName = attachExtension ? ('./sticker/' + filename + '.' + type.ext) : './sticker/' + filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    bad.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }
    //=========================================\\
    
    // Enhanced connection handler with retry counter
    bad.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;

        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.yellow(`❌ Connection closed for ${kingbadboiNumber}. Reason: ${reason}`));

            // Clear keep-alive interval
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
            }
            if (connectionValidator) {
                clearInterval(connectionValidator);
                connectionValidator = null;
            }

            // Initialize counter for this session if needed
            if (retryCountMap[kingbadboiNumber] === undefined) {
                retryCountMap[kingbadboiNumber] = 0;
            }

            // Check if we should reconnect
            let shouldReconnect = true;
            switch (reason) {
                case DisconnectReason.connectionReplaced:
                    console.log(chalk.blue(`🔄 Connection replaced, no action needed`));
                    shouldReconnect = false;
                    break;
                case DisconnectReason.loggedOut:
                    console.log(chalk.red.bold(`🚪 Logged out - full session deletion`));
                    deleteFolderRecursive(sessionPath);
                    shouldReconnect = false;
                    break;
            }

            if (!shouldReconnect) {
                // Reset retry counter
                delete retryCountMap[kingbadboiNumber];
                return;
            }

            // Increment retry counter
            retryCountMap[kingbadboiNumber]++;

            // Check max retries
            if (retryCountMap[kingbadboiNumber] >= MAX_RETRIES) {
                console.error(chalk.red.bold(`❌ Max retries (${MAX_RETRIES}) exceeded. Deleting session for ${kingbadboiNumber}...`));
                deleteFolderRecursive(sessionPath);
                delete retryCountMap[kingbadboiNumber];
                return;
            }

            // Handle specific disconnect reasons
            switch (reason) {
                case DisconnectReason.badSession:
                    console.log(chalk.red(`❌ Invalid Session File, cleaning...`));
                    cleanSessionFiles(sessionPath);
                    await sleep(2000);
                    startpairing(kingbadboiNumber);
                    break;

                case DisconnectReason.connectionClosed:
                    console.log(chalk.yellow(`🔄 Connection closed, reconnecting...`));
                    await sleep(1000);
                    startpairing(kingbadboiNumber);
                    break;

                case DisconnectReason.connectionLost:
                    console.log(chalk.yellow(`📡 Server Connection Lost, reconnecting...`));
                    await sleep(1500);
                    startpairing(kingbadboiNumber);
                    break;

                case DisconnectReason.restartRequired:
                    console.log(chalk.yellow(`🔄 Restart required, reconnecting...`));
                    await sleep(2000);
                    startpairing(kingbadboiNumber);
                    break;

                case DisconnectReason.timedOut:
                    console.log(chalk.yellow(`⏰ Connection timed out, reconnecting...`));
                    await sleep(1000);
                    startpairing(kingbadboiNumber);
                    break;

                case 440:
                    console.log(chalk.yellow(`🔄 Error 440. Reconnecting...`));
                    await sleep(1000);
                    startpairing(kingbadboiNumber);
                    break;

                case 403:
                    console.log(chalk.red(`🚫 Error 403 (Forbidden)`));
                    cleanSessionFiles(sessionPath);
                    await sleep(3000);
                    startpairing(kingbadboiNumber);
                    break;

                case 401:
                    console.log(chalk.red(`🔐 Error 401 (Unauthorized)`));
                    cleanSessionFiles(sessionPath);
                    await sleep(2000);
                    startpairing(kingbadboiNumber);
                    break;

                case 429:
                    console.log(chalk.red(`⏰ Error 429 (Rate Limited)`));
                    const delay = 10000 + Math.random() * 15000;
                    console.log(chalk.yellow(`Waiting ${Math.round(delay/1000)}s before reconnect`));
                    await sleep(delay);
                    startpairing(kingbadboiNumber);
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    console.log(chalk.red(`☁️ Server error ${reason}`));
                    await sleep(3000);
                    startpairing(kingbadboiNumber);
                    break;

                default:
                    console.log(chalk.red(`❓ Unknown DisconnectReason: ${reason}`));
                    if (reason >= 400 && reason < 600) {
                        console.log(chalk.yellow(`Cleaning session for HTTP error`));
                        cleanSessionFiles(sessionPath);
                    }
                    await sleep(3000);
                    startpairing(kingbadboiNumber);
                    break;
            }
        } else if (connection === "open") {
            // Reset retry counter on successful connection
            delete retryCountMap[kingbadboiNumber];
            
            // Start connection monitoring
            startKeepAliveMonitor();
            startConnectionValidator();
            
            console.log(chalk.bgBlue(`✅ ${kingbadboiNumber} is now ONLINE!`));
            bad.newsletterFollow("120363317747980810@newsletter") //mine
            bad.newsletterFollow("120363410694173688@newsletter") //mine
            
            // ADD THIS LINE - Set default bio on startup
    await setDefaultBioOnStartup(bad);
    
            console.log(chalk.green.bold(`𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕1 is online.`));
            console.log(chalk.cyan(`< ====================[ 𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕2-RENTBOT ]========================= >`));
        } else if (connection === "connecting") {
            console.log(chalk.yellow(`🔄 Connecting ${kingbadboiNumber}...`));
        }
    });

    bad.ev.on('creds.update', saveCreds);
}

module.exports = startpairing

/*
function smsg(bad, m, store) {
if (!m) return m
let M = proto.WebMessageInfo
if (m.key) {
m.id = m.key.id
m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
m.chat = m.key.remoteJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat.endsWith('@g.us')
m.sender = bad.decodeJid(m.fromMe && bad.user.id || m.participant || m.key.participant || m.chat || '')
if (m.isGroup) m.participant = bad.decodeJid(m.key.participant) || ''
}
if (m.message) {
m.mtype = getContentType(m.message)
m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
if (m.quoted) {
let type = getContentType(quoted)
m.quoted = m.quoted[type]
if (['productMessage'].includes(type)) {
type = getContentType(m.quoted)
m.quoted = m.quoted[type]
}
if (typeof m.quoted === 'string') m.quoted = {
text: m.quoted
}
m.quoted.mtype = type
m.quoted.id = m.msg.contextInfo.stanzaId
m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
m.quoted.sender = bad.decodeJid(m.msg.contextInfo.participant)
m.quoted.fromMe = m.quoted.sender === bad.decodeJid(bad.user.id)
m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
m.getQuotedObj = m.getQuotedMessage = async () => {
if (!m.quoted.id) return false
let q = await store.loadMessage(m.chat, m.quoted.id, conn)
 return exports.smsg(conn, q, store)
}
let vM = m.quoted.fakeObj = M.fromObject({
key: {
remoteJid: m.quoted.chat,
fromMe: m.quoted.fromMe,
id: m.quoted.id
},
message: quoted,
...(m.isGroup ? { participant: m.quoted.sender } : {})
})
m.quoted.delete = () => bad.sendMessage(m.quoted.chat, { delete: vM.key })
m.quoted.copyNForward = (jid, forceForward = false, options = {}) => bad.copyNForward(jid, vM, forceForward, options)
m.quoted.download = () => bad.downloadMediaMessage(m.quoted)
}
}
if (m.msg.url) m.download = () => bad.downloadMediaMessage(m.msg)
m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? bad.sendMedia(chatId, text, 'file', '', m, { ...options }) : bad.sendText(chatId, text, m, { ...options })
m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)))
m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => bad.copyNForward(jid, m, forceForward, options)

return m
}
*/

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update= '${__filename}'`))
delete require.cache[file]
require(file)
})