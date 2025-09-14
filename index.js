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
const readline = require("readline");
const pino = require('pino')
const FileType = require('file-type')
const fs = require('fs')
const path = require('path')
const themeemoji = "❤️‍🔥";
const chalk = require('chalk')
const { writeExif, imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, reSize } = require('./lib/myfunc')
const { handleMessages, handleGroupParticipantUpdate, handleStatus, handleCalls } = require('./main');
const { setDefaultBioOnStartup } = require('./commands/setbotbio');
const http = require('http');
let config = {};
try {
    if (fs.existsSync('./config.js')) {
        config = require('./config.js');
    } else if (fs.existsSync('./config.json')) {
        config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    }
} catch (error) {
    console.log(chalk.yellow('⚠️  Config file not found or invalid, using defaults'));
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const SESSION_PATH = './session';
let phoneNumber = "";
const pairingCode = process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");

let store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
let msgRetryCounterCache = new NodeCache({
    stdTTL: 60 * 60, 
    useClones: false
});

const CONNECTION_TIMEOUT = 30000;
const KEEP_ALIVE_INTERVAL = 20000;
const MAX_KEEP_ALIVE_FAILURES = 3;
const PORT = process.env.PORT || 3000  // Use environment port or fallback to 3000
const MAX_RETRIES = 3;
const retryCountMap = {};

const idch = [
    "120363317747980810@newsletter",
    "120363410694173688@newsletter"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

async function connectToWhatsApp() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    if (!fs.existsSync(SESSION_PATH)) {
        fs.mkdirSync(SESSION_PATH, { recursive: true });
    }
    
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(SESSION_PATH);

    const sock = makeWASocket({
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
        connectTimeoutMs: CONNECTION_TIMEOUT,
        keepAliveIntervalMs: KEEP_ALIVE_INTERVAL,
        maxIdleTimeMs: 60000,
        maxRetries: MAX_RETRIES,
        retryDelayMs: 2000,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        transactionOpts: {
            maxCommitRetries: 10,
            delayBetweenTriesMs: 3000
        },
        msgRetryCounterCache: msgRetryCounterCache,
        defaultQueryTimeoutMs: 60000,
    });

    store.bind(sock.ev);
    
    console.log("𝗘𝗡𝗧𝗘𝗥 𝗬𝗢𝗨𝗥 𝗣𝗛𝗢𝗡𝗘 𝗡𝗨𝗠𝗕𝗘𝗥: E.g 234912**") 

  
    if (!state.creds.registered) {
        if (useMobile) {
            throw new Error('Cannot use pairing code with mobile API');
        }

        let phoneNumber = config.phoneNumber;

        if (!phoneNumber) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            phoneNumber = await new Promise((resolve) => {
                rl.question(chalk.yellow('🔗 Enter your phone number (with country code): '), (number) => {
                    rl.close();
                    resolve(number);
                });
            });
        } else {
            console.log(chalk.green(`📱 Using phone number from config: ${phoneNumber}`));
        }

        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(cleanNumber, 'EMMYHENZ');
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log(chalk.green(`Your pairing code: ${code}`));
                
                fs.writeFile(
                    path.join(SESSION_PATH, 'pairing_code.txt'),
                    code,
                    'utf8',
                    (err) => {
                        if (err) {
                            console.log(chalk.red(`Error saving pairing code: ${err}`));
                        } else {
                            console.log(chalk.green(`Pairing code saved to pairing_code.txt`));
                        }
                    }
                );
            } catch (error) {
                console.log(chalk.red(`Error requesting pairing code: ${error}`));
            }
        }, 1703);
    }

  
    setupEventHandlers(sock, saveCreds);

    return sock;
}

function setupEventHandlers(sock, saveCreds) {
    let keepAliveFailures = 0;
    let keepAliveInterval;
    
   
    const startKeepAliveMonitor = () => {
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        
        keepAliveInterval = setInterval(async () => {
            try {
               
                await sock.sendPresenceUpdate('available');
                keepAliveFailures = 0;
            } catch (error) {
                keepAliveFailures++;
                console.log(chalk.yellow(`Keep-alive attempt ${keepAliveFailures}/${MAX_KEEP_ALIVE_FAILURES} failed`));
                
                if (keepAliveFailures >= MAX_KEEP_ALIVE_FAILURES) {
                    console.log(chalk.red('Max keep-alive failures reached, forcing reconnect'));
                    clearInterval(keepAliveInterval);
                    sock.end(new Error('Keep-alive failed'));
                }
            }
        }, KEEP_ALIVE_INTERVAL);
    };
    
 
    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && `${decode.user}@${decode.server}` || jid;
        } else {
            return jid;
        }
    };
    
    
    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? 
                mek.message.ephemeralMessage.message : mek.message;

            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(sock, chatUpdate);
                return;
            }

            if (!sock.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;

            try {
                await handleMessages(sock, chatUpdate, true);
            } catch (err) {
                console.error("Error in handleMessages:", err);
                if (mek.key && mek.key.remoteJid) {
                    await sock.sendMessage(mek.key.remoteJid, { 
                        text: '❌ An error occurred while processing your message.',
                    }).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Error in messages.upsert:", err);
        }
    });
    
   
    sock.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(sock, update);
    });
    
   
    sock.ev.on('status.update', async (status) => {
        await handleStatus(sock, status);
    });
    
    
    sock.ev.on('messages.reaction', async (status) => {
        await handleStatus(sock, status);
    });
    
    
    sock.ev.on('call', async (callUpdate) => {
        await handleCalls(sock, callUpdate);
    });
   
   
    sock.sendFromOwner = async (jid, text, quoted, options = {}) => {
        for (const a of jid) {
            await sock.sendMessage(a + '@s.whatsapp.net', { text, ...options }, { quoted });
        }
    };
    
    sock.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : 
                   /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : 
                   /^https?:\/\//.test(path) ? await (await getBuffer(path)) : 
                   fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer;
        
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options);
        } else {
            buffer = await imageToWebp(buff);
        }
        
        await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
            .then(response => {
                fs.unlinkSync(buffer);
                return response;
            });
    };
    
    sock.public = true;
    
    sock.sendText = (jid, text, quoted = '', options) => 
        sock.sendMessage(jid, { text: text, ...options }, { quoted });
    
    sock.getFile = async (PATH, save) => {
        let res;
        let data = Buffer.isBuffer(PATH) ? PATH : 
                  /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : 
                  /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : 
                  fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : 
                  typeof PATH === 'string' ? PATH : Buffer.alloc(0);
        
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
    
    sock.ments = (teks = "") => {
        return teks.match("@") ?
            [...teks.matchAll(/@([0-9]{5,16}|0)/g)].map(
                (v) => v[1] + "@s.whatsapp.net"
            ) : [];
    };
    
    sock.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await sock.getFile(path, true);
        let { res, data: file, filename: pathFile } = type;

        if (res && res.status !== 200 || file.length <= 65536) {
            try {
                throw { json: JSON.parse(file.toString()) };
            } catch (e) {
                if (e.json) throw e.json;
            }
        }

        let opt = { filename };
        if (quoted) opt.quoted = quoted;
        if (!type) options.asDocument = true;

        let mtype = '', mimetype = type.mime, convert;

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
            m = await sock.sendMessage(jid, message, { ...opt, ...options });
        } catch (e) {
            m = null;
        } finally {
            if (!m) m = await sock.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
            file = null;
            return m;
        }
    };

    sock.sendTextWithMentions = async (jid, text, quoted, options = {}) => 
        sock.sendMessage(jid, { 
            text: text, 
            mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), 
            ...options 
        }, { quoted });
    
    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
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

    sock.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        return buffer;
    };
    
    
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.yellow(`❌ Connection closed. Reason: ${reason}`));

        
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
            }

        
            if (retryCountMap['main'] === undefined) {
                retryCountMap['main'] = 0;
            }

       
            let shouldReconnect = true;
            switch (reason) {
                case DisconnectReason.connectionReplaced:
                    console.log(chalk.blue(`🔄 Connection replaced, no action needed`));
                    shouldReconnect = false;
                    break;
                case DisconnectReason.loggedOut:
                    console.log(chalk.red.bold(`🚪 Logged out - full session deletion`));
                    deleteFolderRecursive(SESSION_PATH);
                    shouldReconnect = false;
                    break;
            }

            if (!shouldReconnect) {
                delete retryCountMap['main'];
                return;
            }

            retryCountMap['main']++;

       
            if (retryCountMap['main'] >= MAX_RETRIES) {
                console.error(chalk.red.bold(`❌ Max retries (${MAX_RETRIES}) exceeded. Deleting session...`));
                deleteFolderRecursive(SESSION_PATH);
                delete retryCountMap['main'];
                return;
            }

        
            switch (reason) {
                case DisconnectReason.badSession:
                    console.log(chalk.red(`❌ Invalid Session File, cleaning...`));
                    cleanSessionFiles(SESSION_PATH);
                    await sleep(2000);
                    connectToWhatsApp();
                    break;

                case DisconnectReason.connectionClosed:
                    console.log(chalk.yellow(`🔄 Connection closed, reconnecting...`));
                    await sleep(1000);
                    connectToWhatsApp();
                    break;

                case DisconnectReason.connectionLost:
                    console.log(chalk.yellow(`📡 Server Connection Lost, reconnecting...`));
                    await sleep(1500);
                    connectToWhatsApp();
                    break;

                case DisconnectReason.restartRequired:
                    console.log(chalk.yellow(`🔄 Restart required, reconnecting...`));
                    await sleep(2000);
                    connectToWhatsApp();
                    break;

                case DisconnectReason.timedOut:
                    console.log(chalk.yellow(`⏰ Connection timed out, reconnecting...`));
                    await sleep(1000);
                    connectToWhatsApp();
                    break;

                case 440:
                    console.log(chalk.yellow(`🔄 Error 440. Reconnecting...`));
                    await sleep(1000);
                    connectToWhatsApp();
                    break;

                case 403:
                    console.log(chalk.red(`🚫 Error 403 (Forbidden)`));
                    cleanSessionFiles(SESSION_PATH);
                    await sleep(3000);
                    connectToWhatsApp();
                    break;

                case 401:
                    console.log(chalk.red(`🔐 Error 401 (Unauthorized)`));
                    cleanSessionFiles(SESSION_PATH);
                    await sleep(2000);
                    connectToWhatsApp();
                    break;

                case 429:
                    console.log(chalk.red(`⏰ Error 429 (Rate Limited)`));
                    const delay = 10000 + Math.random() * 15000;
                    console.log(chalk.yellow(`Waiting ${Math.round(delay/1000)}s before reconnect`));
                    await sleep(delay);
                    connectToWhatsApp();
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    console.log(chalk.red(`☁️ Server error ${reason}`));
                    await sleep(3000);
                    connectToWhatsApp();
                    break;

                default:
                    console.log(chalk.red(`❓ Unknown DisconnectReason: ${reason}`));
                    if (reason >= 400 && reason < 600) {
                        console.log(chalk.yellow(`Cleaning session for HTTP error`));
                        cleanSessionFiles(SESSION_PATH);
                    }
                    await sleep(3000);
                    connectToWhatsApp();
                    break;
            }
        } else if (connection === "open") {
        
            delete retryCountMap['main'];
            
       
            startKeepAliveMonitor();
            
            console.log(chalk.bgBlue(`✅ 𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕1 is now ONLINE!`));
            
     
            for (const newsletter of idch) {
                try {
                    await sock.newsletterFollow(newsletter);
                    console.log(chalk.green(`Subscribed to newsletter: ${newsletter}`));
                } catch (error) {
                    console.log(chalk.yellow(`Failed to subscribe to newsletter: ${newsletter}`));
                }
            }
            
            // Set default bio on startup
            await setDefaultBioOnStartup(sock);
            
            console.log(chalk.green.bold(`𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕1 is online.`));
            console.log(chalk.cyan(`< ====================[ 𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕1]========================= >`));
        } else if (connection === "connecting") {
            console.log(chalk.yellow(`🔄 Connecting to WhatsApp...`));
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

async function start() {
    try {
        await connectToWhatsApp();
    } catch (error) {
        console.error(chalk.red('Failed to initialize WhatsApp connection:'), error);
        process.exit(1);
    }
}

process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down gracefully...'));
    rl.close();
    process.exit(0);
});

start();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update= '${__filename}'`));
    delete require.cache[file];
    require(file);
});

http.createServer((req, res) => {
    if (req.url === '/') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500: Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404: Not Found');
    }
}).listen(PORT, () => {
    console.log(`\n𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕1 is running on port ${PORT}`);
    console.log(`🔗 Local access: http://localhost:${PORT}\n`);
});