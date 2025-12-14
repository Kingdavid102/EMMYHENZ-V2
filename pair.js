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
let themeemoji = "❣️";
const chalk = require('chalk')
const { writeExif, imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./allfunc/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, reSize } = require('./allfunc/myfunc')
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

if (!fs.existsSync('./sticker')) fs.mkdirSync('./sticker', { recursive: true });

// Enhanced store configuration for maximum stability
let store = makeInMemoryStore({ 
    logger: pino().child({ level: 'silent', stream: 'store' }),
    maxRetries: 8,
    chatHistoryLimit: 2,
    messageHistoryLimit: 10,
    unreadMessages: false,
});

const scarletHandler = require('./henz-minibot');

// Advanced connection management
let msgRetryCounterCache;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Superior retry management with intelligent backoff
const retryCountMap = new Map();
const MAX_RETRIES = 8;
const RETRY_DELAYS = [1000, 2000, 5000, 15000, 30000, 60000, 120000, 300000];

// Advanced connection tracking
const activeConnections = new Map();
const connectionStats = new Map();

// Optimized timeout settings
const CONNECTION_TIMEOUT = 60000;

// Enhanced keep-alive system
const KEEP_ALIVE_INTERVAL = 12000;
const MAX_KEEP_ALIVE_FAILURES = 8;

// Comprehensive health monitoring
const HEALTH_CHECK_INTERVAL = 25000;

// Auto-follow newsletters (KEPT INTACT AS REQUESTED)
const idch = [
    
    "120363410694173688@newsletter", //Backup
];

// Robust process stability
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.name, '-', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Advanced memory management
setInterval(() => {
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    if (memMB > 200) {
        console.log(`Memory optimization: ${memMB}MB, running cleanup...`);
        
        if (global.gc) {
            global.gc();
        }
        
        if (msgRetryCounterCache) {
            msgRetryCounterCache.flushAll();
        }
        
        if (store.messages) {
            const now = Date.now();
            for (const [jid, messages] of store.messages.entries()) {
                if (messages.length > 30) {
                    store.messages.set(jid, messages.slice(-30));
                }
            }
        }
    }
}, 5 * 60 * 1000);

// Connection pool management
function cleanupConnection(kingbadboiNumber) {
    if (activeConnections.has(kingbadboiNumber)) {
        const connection = activeConnections.get(kingbadboiNumber);
        if (connection.keepAliveInterval) {
            clearInterval(connection.keepAliveInterval);
        }
        if (connection.healthCheckInterval) {
            clearInterval(connection.healthCheckInterval);
        }
        activeConnections.delete(kingbadboiNumber);
    }
}

function updateConnectionStats(kingbadboiNumber, status) {
    const stats = connectionStats.get(kingbadboiNumber) || {
        connected: false,
        lastActivity: Date.now(),
        totalReconnects: 0,
        lastReconnect: 0,
        messageCount: 0
    };
    
    stats.connected = status === 'connected';
    if (status === 'connected') {
        stats.lastActivity = Date.now();
        stats.totalReconnects++;
        stats.lastReconnect = Date.now();
    }
    
    connectionStats.set(kingbadboiNumber, stats);
}

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

async function connectWithCredentials(kingbadboiNumber) {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    // UPDATED: Using Chrome browser format
    const bad = makeWASocket({
        logger: pino({ 
            level: "silent",
            transport: {
                target: 'pino-pretty',
                options: { colorize: true }
            }
        }),
        printQRInTerminal: false,
        auth: state,
        version: [2, 3000, 1027934701],
        // UPDATED: Chrome browser format
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        getMessage: async key => {
            try {
                const jid = jidNormalizedUser(key.remoteJid);
                const msg = await store.loadMessage(jid, key.id);
                return msg?.message || '';
            } catch (error) {
                return '';
            }
        },
        shouldSyncHistoryMessage: msg => {
            console.log(`\x1b[32mLoading Chat [${msg.progress}%]\x1b[39m`);
            return !!msg.syncType;
        },
        // Maximum connection stability settings
        connectTimeoutMs: CONNECTION_TIMEOUT,
        keepAliveIntervalMs: KEEP_ALIVE_INTERVAL,
        maxIdleTimeMs: 120000,
        maxRetries: MAX_RETRIES,
        retryDelayMs: 1500,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        transactionOpts: {
            maxCommitRetries: 20,
            delayBetweenTriesMs: 1000
        },
        msgRetryCounterCache: new NodeCache({
            stdTTL: 20 * 60,
            useClones: false,
            maxKeys: 500
        }),
        defaultQueryTimeoutMs: 45000,
        fireInitQueries: true,
        auth: {
            ...state,
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'fatal' }))
        },
        // Advanced message optimization
        patchMessageBeforeSending: (message) => {
            if (message?.ephemeralMessage) {
                delete message.ephemeralMessage.messageContextInfo;
            }
            return message;
        },
        // Additional stability enhancements
        linkPreviewImageThumbnailWidth: 192,
        generateLinkPreviewIfNotExists: true,
        appStateMacVerification: {
            patch: false,
            snapshot: false
        }
    }, store)

    store.bind(bad.ev);

    return { bad, saveCreds };
}

async function startpairing(kingbadboiNumber) {
    // Cleanup any existing connection
    cleanupConnection(kingbadboiNumber);

    const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;

    // Check if valid credentials exist
    if (hasValidCredentials(sessionPath)) {
        console.log(chalk.blue(`📱 Valid credentials found for ${kingbadboiNumber}, reconnecting...`));
        try {
            const { bad, saveCreds } = await connectWithCredentials(kingbadboiNumber);
            setupEventHandlers(bad, saveCreds, kingbadboiNumber);
            return;
        } catch (error) {
            console.log(chalk.red(`Failed to connect with credentials: ${error.message}`));
            // Fall through to pairing process
        }
    }

    // No valid credentials, start fresh pairing
    console.log(chalk.yellow(`🔗 No valid credentials for ${kingbadboiNumber}, starting pairing process...`));

    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    // UPDATED: Using Chrome browser format
    const bad = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        version: [2, 3000, 1027934701],
        // UPDATED: Chrome browser format
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        getMessage: async key => {
            try {
                const jid = jidNormalizedUser(key.remoteJid);
                const msg = await store.loadMessage(jid, key.id);
                return msg?.message || '';
            } catch (error) {
                return '';
            }
        },
        shouldSyncHistoryMessage: msg => {
            console.log(`\x1b[32mLoading Chat [${msg.progress}%]\x1b[39m`);
            return !!msg.syncType;
        },
        connectTimeoutMs: CONNECTION_TIMEOUT,
        keepAliveIntervalMs: KEEP_ALIVE_INTERVAL,
        maxIdleTimeMs: 120000,
        maxRetries: MAX_RETRIES,
        retryDelayMs: 1500,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        transactionOpts: {
            maxCommitRetries: 20,
            delayBetweenTriesMs: 1000
        },
        msgRetryCounterCache: new NodeCache({
            stdTTL: 20 * 60,
            useClones: false,
            maxKeys: 500
        }),
        defaultQueryTimeoutMs: 45000,
        fireInitQueries: true,
        auth: {
            ...state,
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'fatal' }))
        }
    }, store)

    store.bind(bad.ev);

    if (pairingCode && !state.creds.registered) {
        if (useMobile) {
            throw new Error('Cannot use pairing code with mobile API');
        }

        let phoneNumber = kingbadboiNumber.replace(/[^0-9]/g, '');
        setTimeout(async () => {
            try {
                let code = await bad.requestPairingCode(phoneNumber, 'EMMYHENZ');
                code = code?.match(/.{1,4}/g)?.join("-") || code;

                fs.writeFile(
                    './kingbadboitimewisher/pairing/pairing.json',
                    JSON.stringify({ "code": code }, null, 2),
                    'utf8',
                    (err) => {
                        if (err) {
                            console.log(chalk.red(`Error saving pairing code: ${err}`));
                        } else {
                            console.log(chalk.green(`Pairing code saved: ${code}`));
                        }
                    }
                );
            } catch (error) {
                console.log(chalk.red(`Error getting pairing code: ${error.message}`));
            }
        }, 2000);
    }

    setupEventHandlers(bad, saveCreds, kingbadboiNumber);
}

function setupEventHandlers(bad, saveCreds, kingbadboiNumber) {
    // Superior connection health monitoring
    let lastMessageReceived = Date.now();
    let connectionValidator;
    let keepAliveFailures = 0;
    let keepAliveInterval;
    let healthCheckInterval;
    
    // Store connection in active connections map
    activeConnections.set(kingbadboiNumber, {
        socket: bad,
        keepAliveInterval: null,
        healthCheckInterval: null,
        lastActivity: Date.now()
    });
    
    const startKeepAliveMonitor = () => {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    
    keepAliveInterval = setInterval(async () => {
        try {
            const presences = ['unavailable', 'available', 'composing', 'recording', 'paused'];
            const randomPresence = presences[Math.floor(Math.random() * presences.length)];
            
            await bad.sendPresenceUpdate(randomPresence);
            
            // Force refresh every 12 hours
            const now = Date.now();
            const conn = activeConnections.get(kingbadboiNumber);
            if (conn && (now - conn.lastActivity) > 12 * 60 * 60 * 1000) {
                try {
                    await bad.readMessages([{ remoteJid: 'status@broadcast', id: 'keepalive', fromMe: true }]);
                    console.log(chalk.green(`🔄 12-hour refresh for ${kingbadboiNumber}`));
                } catch (e) {
                    // Ignore
                }
            }
            
            keepAliveFailures = 0;
            
            if (conn) {
                conn.lastActivity = Date.now();
            }
        } catch (error) {
            keepAliveFailures++;
            console.log(chalk.yellow(`Keep-alive attempt ${keepAliveFailures}/${MAX_KEEP_ALIVE_FAILURES} failed`));
            
            if (keepAliveFailures >= MAX_KEEP_ALIVE_FAILURES) {
                console.log(chalk.red('Max keep-alive failures, reconnecting'));
                clearInterval(keepAliveInterval);
                bad.end(new Error('Keep-alive failed'));
            }
        }
    }, KEEP_ALIVE_INTERVAL);
    
    const conn = activeConnections.get(kingbadboiNumber);
    if (conn) {
        conn.keepAliveInterval = keepAliveInterval;
    }
};
    
    const startHealthCheck = () => {
        if (healthCheckInterval) clearInterval(healthCheckInterval);
        
        healthCheckInterval = setInterval(async () => {
            const timeSinceLastMessage = Date.now() - lastMessageReceived;
            
            if (timeSinceLastMessage > 8 * 60 * 1000) {
                try {
                    // Comprehensive health check sequence
                    await bad.sendPresenceUpdate('composing');
                    await sleep(300);
                    await bad.sendPresenceUpdate('available');
                    await sleep(300);
                    await bad.sendPresenceUpdate('recording');
                    await sleep(300);
                    await bad.sendPresenceUpdate('paused');
                    
                    console.log(`Health check passed for ${kingbadboiNumber}`);
                } catch (error) {
                    console.log(`Health check failed for ${kingbadboiNumber}, reconnecting...`);
                    bad.end(new Error('Health check failed'));
                }
            }
        }, HEALTH_CHECK_INTERVAL);
        
        // Update active connections
        const conn = activeConnections.get(kingbadboiNumber);
        if (conn) {
            conn.healthCheckInterval = healthCheckInterval;
        }
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
            if (!chatUpdate.messages || !Array.isArray(chatUpdate.messages) || chatUpdate.messages.length === 0) return;

            const badboijid = chatUpdate.messages[0];
            if (!badboijid || !badboijid.message) return;
            
            // Update message count in stats
            const stats = connectionStats.get(kingbadboiNumber) || { messageCount: 0 };
            stats.messageCount++;
            connectionStats.set(kingbadboiNumber, stats);

            // AUTO-FOLLOW FUNCTIONALITY - KEPT COMPLETELY INTACT
            const message = chatUpdate.messages[0];
            if (message?.key) {
                const jid = message.key.remoteJid;
                
                // Check if message is from a newsletter in our list
                if (idch.includes(jid)) {
                    try {
                        /*const emojis = ['🩵', '🔥', '😀', '👍', '🐭'];*/
                        const { emojis } = require('./autoreact');
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        const messageId = message.newsletterServerId;

                        if (!messageId) {
                            console.warn('No newsletterServerId found in message:', message);
                            return;
                        }

                        let retries = 3;
                        while (retries-- > 0) {
                            try {
                                await bad.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
                                console.log(`✅ Reacted to newsletter ${jid} with ${randomEmoji}`);
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
            }
                 
            badboijid.message = (Object.keys(badboijid.message)[0] === 'ephemeralMessage') ? badboijid.message.ephemeralMessage.message : badboijid.message;
            let botNumber = await bad.decodeJid(bad.user.id);
            let antiswview = global.db?.data?.settings?.[botNumber]?.antiswview || false;

            if (antiswview) {
                if (badboijid.key && badboijid.key.remoteJid === 'status@broadcast') {
                    await bad.readMessages([badboijid.key]);
                }
            }

            if (!bad.public && !badboijid.key.fromMe && chatUpdate.type === 'notify') return;
            if (badboijid.key && badboijid.key.id && badboijid.key.id.startsWith('BAE5') && badboijid.key.id.length === 16) return;

            badboiConnect = bad
            mek = smsg(badboiConnect, badboijid, store);
            scarletHandler(badboiConnect, mek, chatUpdate, store);
        } catch (err) {
            console.log('Error in message processing:', err.message);
        }
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
            .then(response => {
                fs.unlinkSync(buffer)
                return response
            })
    }

    bad.public = true

    bad.sendText = (jid, text, quoted = '', options) => bad.sendMessage(jid, { text: text, ...options }, { quoted })

    bad.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
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
            m = null;
        } finally {
            if (!m) m = await bad.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
            file = null;
            return m;
        }
    }

    bad.sendTextWithMentions = async (jid, text, quoted, options = {}) => bad.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })

    bad.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        let trueFileName = attachExtension ? ('./sticker/' + filename + '.' + type.ext) : './sticker/' + filename
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    bad.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    // Ultimate connection handler with intelligent recovery
    bad.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;

        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.yellow(`❌ Connection closed for ${kingbadboiNumber}. Reason: ${reason}`));

            // Cleanup intervals
            cleanupConnection(kingbadboiNumber);
            updateConnectionStats(kingbadboiNumber, 'disconnected');

            // Advanced retry counter with exponential backoff
            if (retryCountMap.has(kingbadboiNumber)) {
                retryCountMap.set(kingbadboiNumber, retryCountMap.get(kingbadboiNumber) + 1);
            } else {
                retryCountMap.set(kingbadboiNumber, 1);
            }

            const currentRetries = retryCountMap.get(kingbadboiNumber);
            const retryDelay = RETRY_DELAYS[Math.min(currentRetries - 1, RETRY_DELAYS.length - 1)];

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
                retryCountMap.delete(kingbadboiNumber);
                return;
            }

            // Check max retries
            if (currentRetries >= MAX_RETRIES) {
                console.error(chalk.red.bold(`❌ Max retries (${MAX_RETRIES}) exceeded. Deleting session for ${kingbadboiNumber}...`));
                deleteFolderRecursive(sessionPath);
                retryCountMap.delete(kingbadboiNumber);
                return;
            }

            console.log(chalk.yellow(`🔄 Retry ${currentRetries}/${MAX_RETRIES} in ${retryDelay/1000}s...`));
            
            // Intelligent reconnection with exponential backoff
            setTimeout(async () => {
                try {
                    await startpairing(kingbadboiNumber);
                } catch (error) {
                    console.log(chalk.red(`Reconnection attempt failed: ${error.message}`));
                }
            }, retryDelay);

        } else if (connection === "open") {
            // Reset retry counter on successful connection
            retryCountMap.delete(kingbadboiNumber);
            updateConnectionStats(kingbadboiNumber, 'connected');

            // Start advanced monitoring
            startKeepAliveMonitor();
            startHealthCheck();

            console.log(chalk.bgBlue(`✅ ${kingbadboiNumber} is now ONLINE!`));
            
            // AUTO-FOLLOW FUNCTIONALITY - KEPT COMPLETELY INTACT
            bad.newsletterFollow("120363317747980810@newsletter") //mine main channel 
            bad.newsletterFollow("120363410694173688@newsletter") //Backup
            
            console.log(chalk.green.bold(`❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥 Active.`));
            console.log(chalk.cyan(`< ====================[ ❤🎉𝙴𝙼𝙼𝚈𝙷𝙴𝙽𝚉 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃❤️‍🔥 ]========================= >`));
        } else if (connection === "connecting") {
            console.log(chalk.yellow(`🔄 Connecting ${kingbadboiNumber}...`));
        }
    });

    bad.ev.on('creds.update', saveCreds);
    
    // Force reconnect every 20 hours
const forceReconnectTimer = setInterval(() => {
    const uptime = process.uptime();
    if (uptime > 20 * 60 * 60) {
        console.log(chalk.yellow(`♻️ 20-hour auto-reconnect for ${kingbadboiNumber}`));
        bad.end(new Error('Scheduled reconnect'));
        clearInterval(forceReconnectTimer);
    }
}, 60 * 60 * 1000);
}

// Enhanced smsg function with superior error handling
function smsg(bad, m, store) {
    if (!m) return m
    const M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.key.id && m.key.id.startsWith("BAE5") && m.key.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat && m.chat.endsWith("@g.us")
        m.sender = bad.decodeJid((m.fromMe && bad.user && bad.user.id) || m.participant || (m.key && m.key.participant) || m.chat || "")
        if (m.isGroup) m.participant = bad.decodeJid(m.key.participant) || ""
    }

    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg =
            m.mtype === "viewOnceMessage"
                ? m.message[m.mtype]?.message?.[getContentType(m.message[m.mtype]?.message)]
                : m.message[m.mtype]
        m.body =
            m.message?.conversation ||
            m.msg?.caption ||
            m.msg?.text ||
            (m.mtype === "listResponseMessage" && m.msg?.singleSelectReply?.selectedRowId) ||
            (m.mtype === "buttonsResponseMessage" && m.msg?.selectedButtonId) ||
            (m.mtype === "viewOnceMessage" && m.msg?.caption) ||
            m.text ||
            ""

        const quoted = (m.quoted = m.msg?.contextInfo?.quotedMessage || null)
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []

        if (m.quoted) {
            try {
                const rawQuoted = m.quoted
                const quotedWrapper = rawQuoted.viewOnceMessage?.message || rawQuoted.viewOnceMessageV2?.message || rawQuoted
                const type = getContentType(quotedWrapper)
                const content = quotedWrapper?.[type]

                if (content) {
                    m.quoted = content
                    if (["productMessage"].includes(type)) {
                        const nestedType = getContentType(m.quoted)
                        m.quoted = m.quoted?.[nestedType] || m.quoted
                    }
                    if (typeof m.quoted === "string") m.quoted = { text: m.quoted }
                    m.quoted.mtype = type
                    m.quoted.id = m.msg?.contextInfo?.stanzaId
                    m.quoted.chat = m.msg?.contextInfo?.remoteJid || m.chat
                    m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16 : false
                    m.quoted.sender = bad.decodeJid(m.msg?.contextInfo?.participant)
                    m.quoted.fromMe = m.quoted.sender === bad.decodeJid(bad.user.id)
                    m.quoted.text =
                        m.quoted.text ||
                        m.quoted.caption ||
                        m.quoted.conversation ||
                        m.quoted.contentText ||
                        m.quoted.selectedDisplayText ||
                        m.quoted.title ||
                        ""
                    m.quoted.mentionedJid = m.msg?.contextInfo?.mentionedJid || []
                    m.quoted.message = quotedWrapper
                    m.quoted.download = () => bad.downloadMediaMessage(m.quoted)
                }
            } catch (err) {
                // Silent error handling
            }
        }
    }

    if (m.msg?.url) m.download = () => bad.downloadMediaMessage(m.msg)
    m.text =
        m.msg?.text ||
        m.msg?.caption ||
        m.message?.conversation ||
        m.msg?.contentText ||
        m.msg?.selectedDisplayText ||
        m.msg?.title ||
        ""
    m.reply = (text, chatId = m.chat, options = {}) =>
        Buffer.isBuffer(text)
            ? bad.sendMedia(chatId, text, "file", "", m, { ...options })
            : bad.sendText(chatId, text, m, { ...options })

    return m
}

module.exports = { startpairing, activeConnections };

// Enhanced file watching with superior error handling
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    try {
        fs.unwatchFile(file)
        console.log(chalk.redBright(`Update= '${__filename}'`))
        delete require.cache[file]
        require(file)
    } catch (error) {
        console.log('Error reloading file:', error.message)
    }
})