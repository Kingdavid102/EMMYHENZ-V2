const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const channelInfo = {
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

// Data file paths
const DATA_DIR = './data';
const ANTITAG_FILE = path.join(DATA_DIR, 'antitag.json');
const ANTIBOT_FILE = path.join(DATA_DIR, 'antibot.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json');
const POLLS_FILE = path.join(DATA_DIR, 'polls.json');

// Initialize data files
function initializeDataFiles() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    const files = [
        { path: ANTITAG_FILE, data: {} },
        { path: ANTIBOT_FILE, data: {} },
        { path: REMINDERS_FILE, data: {} },
        { path: POLLS_FILE, data: {} }
    ];
    
    files.forEach(file => {
        if (!fs.existsSync(file.path)) {
            fs.writeFileSync(file.path, JSON.stringify(file.data, null, 2));
        }
    });
}

// Initialize on module load
initializeDataFiles();

// ===========================
// UTILITY FUNCTIONS
// ===========================

function readJsonFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        return {};
    }
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ===========================
// ANTITAG SYSTEM
// ===========================

async function antitagCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        const action = args[0]?.toLowerCase();
        const antitagData = readJsonFile(ANTITAG_FILE);

        if (!action || (action !== 'on' && action !== 'off')) {
            const status = antitagData[chatId] ? 'ON' : 'OFF';
            await sock.sendMessage(chatId, {
                text: `🏷️ *ANTITAG STATUS*\n\nCurrent Status: ${status}\n\nUsage:\n• .antitag on - Enable antitag\n• .antitag off - Disable antitag\n\n*Note: When enabled, tagged messages will be automatically deleted.*`,
                ...channelInfo
            });
            return;
        }

        if (action === 'on') {
            antitagData[chatId] = true;
            await sock.sendMessage(chatId, {
                text: '✅ Antitag enabled! Tagged messages will now be automatically deleted.',
                ...channelInfo
            });
        } else {
            delete antitagData[chatId];
            await sock.sendMessage(chatId, {
                text: '❌ Antitag disabled! Tagged messages will no longer be deleted.',
                ...channelInfo
            });
        }

        writeJsonFile(ANTITAG_FILE, antitagData);

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Antitag error: ' + error.message,
            ...channelInfo
        });
    }
}

async function handleAntitagDetection(sock, chatId, msg) {
    try {
        const antitagData = readJsonFile(ANTITAG_FILE);
        if (!antitagData[chatId]) return false;

        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) return false;

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        // Don't delete admin messages
        if (adminStatus.isSenderAdmin || msg.key.fromMe) return false;

        // Check if message contains mentions
        const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const messageText = msg.message?.conversation || 
                           msg.message?.extendedTextMessage?.text || '';

        if (mentionedJids.length > 0 || messageText.includes('@')) {
            await sock.sendMessage(chatId, { delete: msg.key });
            await sock.sendMessage(chatId, {
                text: '🗑️ Tagged message deleted by antitag system.',
                ...channelInfo
            });
            return true;
        }

        return false;
    } catch (error) {
        console.error('Antitag detection error:', error);
        return false;
    }
}

async function encryptCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔒 Usage: .encrypt [text]\n\nExample: .encrypt Hello World',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const encrypted = Buffer.from(text).toString('base64');
        
        await sock.sendMessage(chatId, {
            text: `🔒 *ENCRYPTED MESSAGE*\n\nOriginal: ${text}\nEncrypted: \`${encrypted}\`\n\n_Use .decrypt to decode this message_`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Encryption error: ' + error.message,
            ...channelInfo
        });
    }
}

async function decryptCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔓 Usage: .decrypt [encrypted_text]\n\nExample: .decrypt SGVsbG8gV29ybGQ=',
                ...channelInfo
            });
            return;
        }

        const encrypted = args.join(' ');
        
        try {
            const decrypted = Buffer.from(encrypted, 'base64').toString('utf8');
            
            await sock.sendMessage(chatId, {
                text: `🔓 *DECRYPTED MESSAGE*\n\nEncrypted: ${encrypted}\nDecrypted: ${decrypted}`,
                ...channelInfo
            });
        } catch (decodeError) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid encrypted text. Make sure it\'s properly encoded.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Decryption error: ' + error.message,
            ...channelInfo
        });
    }
}

// ===========================
// ANTIBOT SYSTEM
// ===========================

async function antibotCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        if (!adminStatus.isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Bot must be an admin to use antibot feature.',
                ...channelInfo
            });
            return;
        }

        const action = args[0]?.toLowerCase();
        const antibotData = readJsonFile(ANTIBOT_FILE);

        if (!action || (action !== 'on' && action !== 'off')) {
            const status = antibotData[chatId] ? 'ON' : 'OFF';
            await sock.sendMessage(chatId, {
                text: `🤖 *ANTIBOT STATUS*\n\nCurrent Status: ${status}\n\nUsage:\n• .antibot on - Enable antibot\n• .antibot off - Disable antibot\n\n*Note: When enabled, other bots will be automatically kicked.*`,
                ...channelInfo
            });
            return;
        }

        if (action === 'on') {
            antibotData[chatId] = true;
            await sock.sendMessage(chatId, {
                text: '✅ Antibot enabled! Other bots will be automatically removed.',
                ...channelInfo
            });
        } else {
            delete antibotData[chatId];
            await sock.sendMessage(chatId, {
                text: '❌ Antibot disabled! Other bots will no longer be removed.',
                ...channelInfo
            });
        }

        writeJsonFile(ANTIBOT_FILE, antibotData);

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Antibot error: ' + error.message,
            ...channelInfo
        });
    }
}

async function handleAntibotDetection(sock, chatId, participants, action) {
    try {
        const antibotData = readJsonFile(ANTIBOT_FILE);
        if (!antibotData[chatId] || action !== 'add') return;

        for (const participant of participants) {
            try {
                // Simple bot detection heuristics
                const number = participant.split('@')[0];
                
                // Check for bot-like patterns
                const isBotLike = (
                    number.length < 10 || // Too short numbers
                    /^[0-9]{5}[0-9]+$/.test(number) || // Sequential patterns
                    number.includes('bot') ||
                    number.includes('api') ||
                    number.includes('whatsapp') ||
                    number.endsWith('000') ||
                    number.endsWith('111') ||
                    number.endsWith('999')
                );

                if (isBotLike) {
                    await sock.groupParticipantsUpdate(chatId, [participant], 'remove');
                    await sock.sendMessage(chatId, {
                        text: `🤖 Potential bot detected and removed: +${number}`,
                        ...channelInfo
                    });
                }
            } catch (error) {
                console.error('Error removing potential bot:', error);
            }
        }
    } catch (error) {
        console.error('Antibot detection error:', error);
    }
}

// ===========================
// PRODUCTIVITY COMMANDS
// ===========================

async function reminderCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '❌ Usage: .reminder [minutes] [message]\n\nExample: .reminder 30 Meeting with team',
                ...channelInfo
            });
            return;
        }

        const minutes = parseInt(args[0]);
        if (isNaN(minutes) || minutes <= 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a valid number of minutes.',
                ...channelInfo
            });
            return;
        }

        const message = args.slice(1).join(' ');
        const senderId = msg.key.participant || msg.key.remoteJid;

        await sock.sendMessage(chatId, {
            text: `⏰ Reminder set for ${minutes} minute(s): "${message}"`,
            ...channelInfo
        });

        setTimeout(async () => {
            await sock.sendMessage(chatId, {
                text: `🔔 *REMINDER*\n\n${message}\n\n_Set ${minutes} minute(s) ago_`,
                mentions: [senderId],
                ...channelInfo
            });
        }, minutes * 60 * 1000);

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Reminder error: ' + error.message,
            ...channelInfo
        });
    }
}

async function calculatorCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🧮 *CALCULATOR*\n\nUsage: .calculator [expression]\n\nExamples:\n• .calculator 2+2\n• .calculator 15*8/4\n• .calculator sqrt(64)\n• .calculator sin(90)',
                ...channelInfo
            });
            return;
        }

        const expression = args.join('');
        
        // Basic security check
        if (/[a-zA-Z]/.test(expression.replace(/sin|cos|tan|sqrt|log|abs|ceil|floor|round|pi|e/g, ''))) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid expression. Use only numbers and math operators.',
                ...channelInfo
            });
            return;
        }

        try {
            // Replace common math functions
            const mathExpression = expression
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/log/g, 'Math.log')
                .replace(/abs/g, 'Math.abs')
                .replace(/ceil/g, 'Math.ceil')
                .replace(/floor/g, 'Math.floor')
                .replace(/round/g, 'Math.round')
                .replace(/pi/g, 'Math.PI')
                .replace(/e/g, 'Math.E');

            const result = eval(mathExpression);

            await sock.sendMessage(chatId, {
                text: `🧮 *CALCULATOR RESULT*\n\nExpression: ${expression}\nResult: ${result}`,
                ...channelInfo
            });

        } catch (evalError) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid mathematical expression.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Calculator error: ' + error.message,
            ...channelInfo
        });
    }
}

async function passwordCommand(sock, chatId, msg, args) {
    try {
        const length = parseInt(args[0]) || 12;
        if (length < 4 || length > 50) {
            await sock.sendMessage(chatId, {
                text: '❌ Password length must be between 4 and 50 characters.',
                ...channelInfo
            });
            return;
        }

        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        await sock.sendMessage(chatId, {
            text: `🔐 *GENERATED PASSWORD*\n\nLength: ${length} characters\nPassword: \`${password}\`\n\n_Keep this secure!_`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Password generation error: ' + error.message,
            ...channelInfo
        });
    }
}

async function hashCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔢 Usage: .hash [text]\n\nGenerates MD5, SHA1, and SHA256 hashes of the text.',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const md5 = crypto.createHash('md5').update(text).digest('hex');
        const sha1 = crypto.createHash('sha1').update(text).digest('hex');
        const sha256 = crypto.createHash('sha256').update(text).digest('hex');

        await sock.sendMessage(chatId, {
            text: `🔢 *HASH GENERATOR*\n\nText: ${text}\n\nMD5: \`${md5}\`\n\nSHA1: \`${sha1}\`\n\nSHA256: \`${sha256}\``,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Hash generation error: ' + error.message,
            ...channelInfo
        });
    }
}

async function base64Command(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🔤 Usage:\n• .base64 encode [text]\n• .base64 decode [base64]',
                ...channelInfo
            });
            return;
        }

        const action = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        if (action === 'encode') {
            const encoded = Buffer.from(text).toString('base64');
            await sock.sendMessage(chatId, {
                text: `🔤 *BASE64 ENCODER*\n\nOriginal: ${text}\nEncoded: \`${encoded}\``,
                ...channelInfo
            });
        } else if (action === 'decode') {
            try {
                const decoded = Buffer.from(text, 'base64').toString('utf8');
                await sock.sendMessage(chatId, {
                    text: `🔤 *BASE64 DECODER*\n\nEncoded: ${text}\nDecoded: ${decoded}`,
                    ...channelInfo
                });
            } catch (decodeError) {
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid base64 string.',
                    ...channelInfo
                });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid action. Use "encode" or "decode".',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Base64 error: ' + error.message,
            ...channelInfo
        });
    }
}

async function binaryCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔢 Usage: .binary [text]\n\nConverts text to binary representation.',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const binary = text.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join(' ');

        await sock.sendMessage(chatId, {
            text: `🔢 *BINARY CONVERTER*\n\nText: ${text}\nBinary: \`${binary}\``,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Binary conversion error: ' + error.message,
            ...channelInfo
        });
    }
}

async function timestampCommand(sock, chatId, msg, args) {
    try {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);

        await sock.sendMessage(chatId, {
            text: `⏰ *CURRENT TIMESTAMP*\n\nDate: ${now.toDateString()}\nTime: ${now.toTimeString()}\nTimestamp: ${timestamp}\nISO: ${now.toISOString()}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Timestamp error: ' + error.message,
            ...channelInfo
        });
    }
}

// ===========================
// ENTERTAINMENT COMMANDS
// ===========================

async function diceCommand(sock, chatId, msg, args) {
    try {
        const sides = parseInt(args[0]) || 6;
        if (sides < 2 || sides > 100) {
            await sock.sendMessage(chatId, {
                text: '❌ Dice sides must be between 2 and 100.',
                ...channelInfo
            });
            return;
        }

        const result = Math.floor(Math.random() * sides) + 1;
        const diceEmoji = sides === 6 ? ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][result - 1] : '🎲';

        await sock.sendMessage(chatId, {
            text: `🎲 *DICE ROLL*\n\n${diceEmoji} You rolled: **${result}**\nDice type: ${sides}-sided`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Dice roll error: ' + error.message,
            ...channelInfo
        });
    }
}

async function coinCommand(sock, chatId, msg, args) {
    try {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '👑' : '🪙';

        await sock.sendMessage(chatId, {
            text: `🪙 *COIN FLIP*\n\n${emoji} Result: **${result}**`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Coin flip error: ' + error.message,
            ...channelInfo
        });
    }
}

async function randomCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🎲 Usage: .random [min] [max]\n\nExample: .random 1 100',
                ...channelInfo
            });
            return;
        }

        const min = parseInt(args[0]);
        const max = parseInt(args[1]);

        if (isNaN(min) || isNaN(max)) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide valid numbers.',
                ...channelInfo
            });
            return;
        }

        if (min >= max) {
            await sock.sendMessage(chatId, {
                text: '❌ Minimum must be less than maximum.',
                ...channelInfo
            });
            return;
        }

        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        await sock.sendMessage(chatId, {
            text: `🎲 *RANDOM NUMBER*\n\nRange: ${min} - ${max}\nResult: **${result}**`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Random number error: ' + error.message,
            ...channelInfo
        });
    }
}

async function pickCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🎯 Usage: .pick [option1] [option2] [option3]...\n\nExample: .pick pizza burger tacos',
                ...channelInfo
            });
            return;
        }

        const options = args;
        const chosen = options[Math.floor(Math.random() * options.length)];

        await sock.sendMessage(chatId, {
            text: `🎯 *RANDOM PICKER*\n\nOptions: ${options.join(', ')}\nChosen: **${chosen}**`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Pick command error: ' + error.message,
            ...channelInfo
        });
    }
}

async function ageCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🎂 Usage: .age [YYYY-MM-DD]\n\nExample: .age 1995-06-15',
                ...channelInfo
            });
            return;
        }

        const dateString = args[0];
        const birthDate = new Date(dateString);
        const today = new Date();

        if (isNaN(birthDate.getTime())) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid date format. Use YYYY-MM-DD',
                ...channelInfo
            });
            return;
        }

        const ageMs = today - birthDate;
        const ageDate = new Date(ageMs);
        const years = ageDate.getUTCFullYear() - 1970;
        const months = ageDate.getUTCMonth();
        const days = ageDate.getUTCDate() - 1;

        await sock.sendMessage(chatId, {
            text: `🎂 *AGE CALCULATOR*\n\nBirth Date: ${birthDate.toDateString()}\nAge: ${years} years, ${months} months, ${days} days\nTotal Days: ${Math.floor(ageMs / (1000 * 60 * 60 * 24))}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Age calculation error: ' + error.message,
            ...channelInfo
        });
    }
}

// ===========================
// TEXT ANALYSIS COMMANDS
// ===========================

async function countCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '📊 Usage: .count [text]\n\nCounts characters, words, and lines.',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const words = text.trim().split(/\s+/).length;
        const lines = text.split('\n').length;

        await sock.sendMessage(chatId, {
            text: `📊 *TEXT ANALYSIS*\n\nText: "${text}"\n\nCharacters: ${characters}\nCharacters (no spaces): ${charactersNoSpaces}\nWords: ${words}\nLines: ${lines}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Count error: ' + error.message,
            ...channelInfo
        });
    }
}

async function reverseCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔄 Usage: .reverse [text]',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const reversed = text.split('').reverse().join('');

        await sock.sendMessage(chatId, {
            text: `🔄 *TEXT REVERSER*\n\nOriginal: ${text}\nReversed: ${reversed}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Reverse error: ' + error.message,
            ...channelInfo
        });
    }
}

async function caseCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🔤 Usage: .case [upper/lower/title] [text]\n\nExamples:\n• .case upper hello world\n• .case lower HELLO WORLD\n• .case title hello world',
                ...channelInfo
            });
            return;
        }

        const caseType = args[0].toLowerCase();
        const text = args.slice(1).join(' ');
        let result;

        switch (caseType) {
            case 'upper':
                result = text.toUpperCase();
                break;
            case 'lower':
                result = text.toLowerCase();
                break;
            case 'title':
                result = text.replace(/\w\S*/g, (txt) => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                break;
            default:
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid case type. Use: upper, lower, or title',
                    ...channelInfo
                });
                return;
        }

        await sock.sendMessage(chatId, {
            text: `🔤 *CASE CONVERTER*\n\nOriginal: ${text}\n${caseType.toUpperCase()}: ${result}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Case conversion error: ' + error.message,
            ...channelInfo
        });
    }
}

async function palindromeCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🪞 Usage: .palindrome [text]\n\nChecks if text reads the same forwards and backwards.',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
        const reversed = cleaned.split('').reverse().join('');
        const isPalindrome = cleaned === reversed;

        await sock.sendMessage(chatId, {
            text: `🪞 *PALINDROME CHECKER*\n\nText: ${text}\nCleaned: ${cleaned}\nIs Palindrome: ${isPalindrome ? '✅ YES' : '❌ NO'}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Palindrome check error: ' + error.message,
            ...channelInfo
        });
    }
}

// ===========================
// GROUP ACTIVITY COMMANDS
// ===========================

async function pollCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length < 3) {
            await sock.sendMessage(chatId, {
                text: '📊 Usage: .poll [question] [option1] [option2] [option3]...\n\nExample: .poll "Favorite color?" red blue green yellow',
                ...channelInfo
            });
            return;
        }

        const question = args[0];
        const options = args.slice(1);

        if (options.length < 2 || options.length > 10) {
            await sock.sendMessage(chatId, {
                text: '❌ Poll must have between 2 and 10 options.',
                ...channelInfo
            });
            return;
        }

        const pollId = Date.now().toString();
        const pollsData = readJsonFile(POLLS_FILE);
        
        pollsData[chatId] = pollsData[chatId] || {};
        pollsData[chatId][pollId] = {
            question,
            options,
            votes: {},
            created: Date.now(),
            creator: msg.key.participant || msg.key.remoteJid
        };

        writeJsonFile(POLLS_FILE, pollsData);

        let pollText = `📊 *POLL CREATED*\n\nQuestion: ${question}\n\nOptions:\n`;
        options.forEach((option, index) => {
            pollText += `${index + 1}. ${option}\n`;
        });
        pollText += `\nTo vote, use: .vote ${pollId} [option number]`;

        await sock.sendMessage(chatId, {
            text: pollText,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Poll creation error: ' + error.message,
            ...channelInfo
        });
    }
}

async function voteCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🗳️ Usage: .vote [poll_id] [option_number]\n\nExample: .vote 123456789 2',
                ...channelInfo
            });
            return;
        }

        const pollId = args[0];
        const optionNumber = parseInt(args[1]);
        const voterId = msg.key.participant || msg.key.remoteJid;
        
        const pollsData = readJsonFile(POLLS_FILE);
        
        if (!pollsData[chatId] || !pollsData[chatId][pollId]) {
            await sock.sendMessage(chatId, {
                text: '❌ Poll not found.',
                ...channelInfo
            });
            return;
        }

        const poll = pollsData[chatId][pollId];
        
        if (optionNumber < 1 || optionNumber > poll.options.length) {
            await sock.sendMessage(chatId, {
                text: `❌ Invalid option. Choose between 1 and ${poll.options.length}.`,
                ...channelInfo
            });
            return;
        }

        poll.votes[voterId] = optionNumber;
        writeJsonFile(POLLS_FILE, pollsData);

        await sock.sendMessage(chatId, {
            text: `✅ Your vote for "${poll.options[optionNumber - 1]}" has been recorded!`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Voting error: ' + error.message,
            ...channelInfo
        });
    }
}

async function resultsCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const pollsData = readJsonFile(POLLS_FILE);
        
        if (!pollsData[chatId] || Object.keys(pollsData[chatId]).length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ No polls found in this group.',
                ...channelInfo
            });
            return;
        }

        const pollId = args[0] || Object.keys(pollsData[chatId]).pop(); // Get latest poll if no ID provided
        const poll = pollsData[chatId][pollId];

        if (!poll) {
            await sock.sendMessage(chatId, {
                text: '❌ Poll not found.',
                ...channelInfo
            });
            return;
        }

        const voteCounts = {};
        poll.options.forEach((_, index) => {
            voteCounts[index + 1] = 0;
        });

        Object.values(poll.votes).forEach(vote => {
            voteCounts[vote]++;
        });

        const totalVotes = Object.keys(poll.votes).length;

        let resultsText = `📊 *POLL RESULTS*\n\nQuestion: ${poll.question}\nTotal Votes: ${totalVotes}\n\n`;
        
        poll.options.forEach((option, index) => {
            const count = voteCounts[index + 1];
            const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0;
            resultsText += `${index + 1}. ${option}: ${count} votes (${percentage}%)\n`;
        });

        await sock.sendMessage(chatId, {
            text: resultsText,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Results error: ' + error.message,
            ...channelInfo
        });
    }
}

// ===========================
// CURRENCY & CRYPTO COMMANDS
// ===========================

async function currencyCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 3) {
            await sock.sendMessage(chatId, {
                text: '💱 Usage: .currency [amount] [from] [to]\n\nExample: .currency 100 USD EUR\n\nCommon codes: USD, EUR, GBP, JPY, CAD, AUD, INR, CNY',
                ...channelInfo
            });
            return;
        }

        const amount = parseFloat(args[0]);
        const from = args[1].toUpperCase();
        const to = args[2].toUpperCase();

        if (isNaN(amount)) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid amount.',
                ...channelInfo
            });
            return;
        }

        try {
            const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
            const rate = response.data.rates[to];

            if (!rate) {
                await sock.sendMessage(chatId, {
                    text: '❌ Currency not found.',
                    ...channelInfo
                });
                return;
            }

            const converted = (amount * rate).toFixed(2);

            await sock.sendMessage(chatId, {
                text: `💱 *CURRENCY CONVERTER*\n\n${amount} ${from} = ${converted} ${to}\nRate: 1 ${from} = ${rate.toFixed(4)} ${to}`,
                ...channelInfo
            });

        } catch (apiError) {
            await sock.sendMessage(chatId, {
                text: '❌ Currency conversion service unavailable.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Currency conversion error: ' + error.message,
            ...channelInfo
        });
    }
}

async function cryptoCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '₿ Usage: .crypto [coin]\n\nExample: .crypto bitcoin\n\nSupported: bitcoin, ethereum, cardano, polkadot, chainlink',
                ...channelInfo
            });
            return;
        }

        const coin = args[0].toLowerCase();

        try {
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`);
            
            if (!response.data[coin]) {
                await sock.sendMessage(chatId, {
                    text: '❌ Cryptocurrency not found.',
                    ...channelInfo
                });
                return;
            }

            const data = response.data[coin];
            const price = data.usd;
            const change24h = data.usd_24h_change?.toFixed(2) || 0;
            const changeEmoji = change24h >= 0 ? '📈' : '📉';

            await sock.sendMessage(chatId, {
                text: `₿ *CRYPTO PRICE*\n\nCoin: ${coin.toUpperCase()}\nPrice: $${price}\n24h Change: ${changeEmoji} ${change24h}%`,
                ...channelInfo
            });

        } catch (apiError) {
            await sock.sendMessage(chatId, {
                text: '❌ Crypto price service unavailable.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Crypto price error: ' + error.message,
            ...channelInfo
        });
    }
}

// ===========================
// GROUP MANAGEMENT COMMANDS
// ===========================

async function slowmodeCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🐌 Usage: .slowmode [seconds]\n\nExample: .slowmode 30\nSet to 0 to disable.',
                ...channelInfo
            });
            return;
        }

        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a valid number of seconds.',
                ...channelInfo
            });
            return;
        }

        // Note: This would require storing slowmode settings and implementing rate limiting
        await sock.sendMessage(chatId, {
            text: `🐌 Slowmode ${seconds === 0 ? 'disabled' : `set to ${seconds} seconds`}.\n\n_Note: This feature requires additional implementation for full functionality._`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Slowmode error: ' + error.message,
            ...channelInfo
        });
    }
}

async function lockgroupCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Bot must be an admin to lock the group.',
                ...channelInfo
            });
            return;
        }

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        await sock.groupSettingUpdate(chatId, 'announcement');
        
        await sock.sendMessage(chatId, {
            text: '🔒 Group locked! Only admins can send messages.',
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Lock group error: ' + error.message,
            ...channelInfo
        });
    }
}

async function unlockgroupCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Bot must be an admin to unlock the group.',
                ...channelInfo
            });
            return;
        }

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        await sock.groupSettingUpdate(chatId, 'not_announcement');
        
        await sock.sendMessage(chatId, {
            text: '🔓 Group unlocked! All members can send messages.',
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Unlock group error: ' + error.message,
            ...channelInfo
        });
    }
}

// ===========================
// ADDITIONAL ENTERTAINMENT
// ===========================

async function riddleCommand(sock, chatId, msg, args) {
    try {
        const riddles = [
            {
                question: "What has keys but no locks, space but no room, you can enter but not go inside?",
                answer: "A keyboard"
            },
            {
                question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
                answer: "Fire"
            },
            {
                question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
                answer: "The letter M"
            },
            {
                question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
                answer: "A map"
            },
            {
                question: "What gets wet while drying?",
                answer: "A towel"
            }
        ];

        const riddle = riddles[Math.floor(Math.random() * riddles.length)];

        await sock.sendMessage(chatId, {
            text: `🧩 *RIDDLE TIME*\n\n${riddle.question}\n\n_Think you know the answer? Reply with your guess!_\n\n||${riddle.answer}||`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Riddle error: ' + error.message,
            ...channelInfo
        });
    }
}

async function roastCommand(sock, chatId, msg, args) {
    try {
        const roasts = [
            "I'd agree with you but then we'd both be wrong.",
            "You're like a cloud. When you disappear, it's a beautiful day.",
            "I don't have the time or the crayons to explain this to you.",
            "You bring everyone so much joy when you leave the room.",
            "I'd explain it to you, but I don't have any puppets with me.",
            "You're not stupid; you just have bad luck when thinking.",
            "Some people climb the ladder of success. You took the elevator and got stuck between floors.",
            "If I wanted to kill myself, I'd climb your ego and jump to your IQ.",
            "You're like a software update. Whenever I see you, I think 'not now'.",
            "I'm not saying you're dumb, but you need instructions on how to use a rocking chair."
        ];

        const roast = roasts[Math.floor(Math.random() * roasts.length)];

        await sock.sendMessage(chatId, {
            text: `🔥 *RANDOM ROAST*\n\n${roast}\n\n_This is just for fun, don't take it seriously!_`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Roast error: ' + error.message,
            ...channelInfo
        });
    }
}

// Export all functions
module.exports = {
    // Anti systems
    antitagCommand,
    handleAntitagDetection,
    antibotCommand,
    handleAntibotDetection,
    
    // Productivity
    reminderCommand,
    calculatorCommand,
    passwordCommand,
    hashCommand,
    base64Command,
    binaryCommand,
    timestampCommand,
    
    // Entertainment
    diceCommand,
    coinCommand,
    randomCommand,
    pickCommand,
    ageCommand,
    riddleCommand,
    roastCommand,
    
    // ADD THESE TWO MISSING EXPORTS:
    encryptCommand,
    decryptCommand,
    
    // Text Analysis
    countCommand,
    reverseCommand,
    caseCommand,
    palindromeCommand,
    
    // Group Activities
    pollCommand,
    voteCommand,
    resultsCommand,
    
    // Currency & Crypto
    currencyCommand,
    cryptoCommand,
    
    // Group Management
    slowmodeCommand,
    lockgroupCommand,
    unlockgroupCommand
};