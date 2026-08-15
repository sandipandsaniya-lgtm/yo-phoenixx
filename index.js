/**
   * Create By 𝗣𝗛𝗢𝗘𝗡𝗜𝗫𝗫 🐦‍🔥OFFICIAL
   * Contact Me on 917047304568
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');

const AUTH_FILE = './auth.json';
const PAIRING_DIR = './kingbadboitimewisher/pairing/';
const startpairing = require('./pair');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const autoLoadPairs = async () => {
    if (!fs.existsSync(PAIRING_DIR)) {
        fs.mkdirSync(PAIRING_DIR, { recursive: true });
        return;
    }

    const pairedUsers = fs.readdirSync(PAIRING_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => name.endsWith('@s.whatsapp.net'));

    if (pairedUsers.length === 0) {
        return;
    }

    console.log(chalk.green(`✅ ${pairedUsers.length} paired users found. Connecting...`));

    for (let i = 0; i < pairedUsers.length; i++) {
        const userNumber = pairedUsers[i];
        
        try {
            await startpairing(userNumber);
            console.log(chalk.green(`✅ Connected: ${userNumber}`));
            
            if (i < pairedUsers.length - 1) {
                await delay(4000);
            }
        } catch (error) {
            console.log(chalk.red(`❌ Failed for ${userNumber}: ${error.message}`));
            
            if (i < pairedUsers.length - 1) {
                await delay(4000);
            }
        }
    }
};

const initializeBot = async () => {
    await autoLoadPairs();
    launchBot();
};

function launchBot() {
    let telegramLoaded = false;
    let whatsappLoaded = false;
    console.clear();
    console.log(chalk.cyan(figlet.textSync('XSONUXMD', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    })));
    
    console.log(chalk.yellow('═══════════════════════════════════════════════'));
    console.log(chalk.green('   𓆩֓𝐒ᴏɴᴜ x 𝐁ᴏᴛ𓆪 Pairing System       '));
    console.log(chalk.yellow('═══════════════════════════════════════════════'));



    if (!telegramLoaded && !whatsappLoaded) {
        console.log(chalk.red('⚠️  Warning: No bot systems loaded! Check your files.\n'));
    }

    // Load Telegram bot (bot.js)
    const botPath = path.join(__dirname, 'bot.js');
    if (fs.existsSync(botPath)) {
        try {
            require('./bot');
            telegramLoaded = true;
        } catch (error) {
            console.log(chalk.red('❌ Failed to load Telegram bot (bot.js):'), error.message);
        }
    }

    // Load WhatsApp commands (drenox.js)
    const drenoxPath = path.join(__dirname, 'drenox.js');
    if (fs.existsSync(drenoxPath)) {
        try {
            require('./drenox');
            whatsappLoaded = true;
        } catch (error) {
            console.log(chalk.red('❌ Failed to load WhatsApp commands (drenox.js):'), error.message);
        }
    }

    console.log(chalk.cyan('═══════════════════════════════════════════════'));
    console.log(chalk.green('✅ Bot is ready and running!'));
    console.log(chalk.gray('Press Ctrl+C to stop the bot\n'));

    // Error handlers
    const ignoredErrors = [
        'Socket connection timeout',
        'EKEYTYPE',
        'item-not-found',
        'rate-overlimit',
        'Connection Closed',
        'Timed Out',
        'Value not found'
    ];

    process.on('unhandledRejection', (reason, promise) => {
        if (ignoredErrors.some(e => String(reason).includes(e))) return;
        
        console.log(chalk.red('\n⚠️  Unhandled Promise Rejection:'));
        console.log(chalk.yellow('Reason:'), reason);
    });

    process.on('uncaughtException', (error) => {
        if (ignoredErrors.some(e => String(error).includes(e))) return;
        
        console.log(chalk.red('\n❌ Uncaught Exception:'));
        console.log(chalk.yellow('Error:'), error.message);
        if (error.stack) {
            console.log(chalk.gray(error.stack));
        }
    });

    const originalConsoleError = console.error;
    console.error = function (message, ...optionalParams) {
        if (typeof message === 'string' && ignoredErrors.some(e => message.includes(e))) {
            return;
        }
        originalConsoleError.apply(console, [message, ...optionalParams]);
    };

    const originalStderrWrite = process.stderr.write;
    process.stderr.write = function (message, encoding, fd) {
        if (typeof message === 'string' && ignoredErrors.some(e => message.includes(e))) {
            return;
        }
        originalStderrWrite.apply(process.stderr, arguments);
    };

    console.log(chalk.gray('Press Ctrl+C to stop the bot\n'));
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n⚠️  Shutting down gracefully...'));
    console.log(chalk.green('👋 Goodbye!'));
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n\n⚠️  Received termination signal...'));
    process.exit(0);
});

initializeBot().catch((error) => {
    console.log(chalk.red('\n❌ Fatal error during initialization:'));
    console.log(chalk.yellow('Error:'), error.message);
    if (error.stack) {
        console.log(chalk.gray(error.stack));
    }
    process.exit(1);
});
