const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const axios = require('axios');
const path = require('path');
const qrcode = require('qrcode-terminal');

const config = require('./config');
const { sms, downloadMediaMessage } = require('./lib/msg');
const {
  getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson
} = require('./lib/functions');
const { File } = require('megajs');
const { commands, replyHandlers } = require('./command');

const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const ownerNumber = ['94726892483'];
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

async function ensureSessionFile() {
  if (!fs.existsSync(credsPath)) {
    if (!config.SESSION_ID) {
      console.error('❌ SESSION_ID env variable is missing. Cannot restore session.');
      process.exit(1);
    }

    console.log("❗ [SQUID-GAME] SESSION_ID not found in env. Please configure it.");

    const sessdata = config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);

    filer.download((err, data) => {
      if (err) {
        console.error("❌ Failed to download session file from MEGA:", err);
        process.exit(1);
      }

      fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });
      fs.writeFileSync(credsPath, data);
      console.log("📥 [SQUID-GAME] Session file downloaded and saved.");
      setTimeout(() => {
        connectToWA();
      }, 2000);
    });
  } else {
    setTimeout(() => {
      connectToWA();
    }, 1000);
  }
}

async function autoStatusWatchAndReact(rush) {
  // Auto Status Watch & React Section
  const autoWatch = config.AUTO_STATUS_WATCH === "true";
  const reactEmojis = Array.isArray(config.STATUS_REACT) ? config.STATUS_REACT : [config.STATUS_REACT];
  const reactUsers = config.STATUS_REACT_USERS || ["all"];

  if (!autoWatch) return;

  // Fetch all story (status) updates periodically
  setInterval(async () => {
    try {
      const stories = await rush.fetchStatusUpdates();
      if (!stories || stories.length === 0) return;

      for (const story of stories) {
        // View status
        if (!story.seen) {
          try {
            await rush.readStatus(story.id);
            console.log(`👀 Viewed status: ${story.id}`);
          } catch (e) {
            console.error("Error viewing status:", e);
          }
        }

        // React to status
        if (reactEmojis.length > 0 && (reactUsers.includes("all") || reactUsers.includes(story.user))) {
          try {
            const reactEmoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)];
            await rush.sendMessage(story.user + "@s.whatsapp.net", {
              react: { text: reactEmoji, key: { id: story.id } }
            });
            console.log(`💬 Reacted to status (${story.user}) with: ${reactEmoji}`);
          } catch (e) {
            console.error("Error reacting to status:", e);
          }
        }
      }
    } catch (err) {
      console.error("Auto Status Watch/React Error:", err);
    }
  }, 60 * 1000); // Check every 60 seconds
}

async function connectToWA() {
  console.log("🛰️ [SQUID-GAME] Initializing WhatsApp connection...");
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '/auth_info_baileys/'));
  const { version } = await fetchLatestBaileysVersion();

  const rush = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    auth: state,
    version,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  });

  // Auto Status Watch & React — CALL AFTER CONNECTION
  rush.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log('✅ SQUID-GAME connected to WhatsApp');

      // Auto Status Watch & React
      autoStatusWatchAndReact(rush);

      const up = `
╭─────── ○ △ □  ─────────╮
│         🟥 SYSTEM ONLINE 🟦       │
╰──────────────⟡───────╯
│ 👋 *Hi* there, I'm Alive Now!
│ 🍁 *PREFIX:* "."
│ ⚡ *BOT NAME:* SQUID-GAME
│ 🔋 *PLATFORM:* linux
│ 🧩 *VERSION:* 1.0.0
╰───────────────⬣
*🎠 O  W  N  E  R*
🔥 RAMESH DISSANAYAKA 🔥
       `;
      rush.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
        image: { url: 'https://github.com/rush1617/SQUID-GAME/blob/main/Images/Alive.png?raw=true' },
        caption: up
      });

      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") {
          require(`./plugins/${plugin}`);
        }
      });
    }
  });

  rush.ev.on('creds.update', saveCreds);

  rush.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.messageStubType === 68) {
        await rush.sendMessageAck(msg.key);
      }
    }

    const mek = messages[0];
    if (!mek || !mek.message) return;

    mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
    if (mek.key.remoteJid === 'status@broadcast') return
    const m = sms(rush, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const body = type === 'conversation' ? mek.message.conversation : mek.message[type]?.text || mek.message[type]?.caption || '';
    const isCmd = body.startsWith(prefix);
    const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');

    const sender = mek.key.fromMe ? rush.user.id : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const isGroup = from.endsWith('@g.us');
    const botNumber = rush.user.id.split(':')[0];
    const pushname = mek.pushName || 'Sin Nombre';
    const isMe = botNumber.includes(senderNumber);
    const isOwner = ownerNumber.includes(senderNumber) || isMe;
    const botNumber2 = await jidNormalizedUser(rush.user.id);

    const groupMetadata = isGroup ? await rush.groupMetadata(from).catch(() => {}) : '';
    const groupName = isGroup ? groupMetadata.subject : '';
    const participants = isGroup ? groupMetadata.participants : '';
    const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
    const isAdmins = isGroup ? groupAdmins.includes(sender) : false;

    const reply = (text) => rush.sendMessage(from, { text }, { quoted: mek });

    if (isCmd) {
      const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
      if (cmd) {
        if (cmd.react) rush.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
        try {
          cmd.function(rush, mek, m, {
            from, quoted: mek, body, isCmd, command: commandName, args, q,
            isGroup, sender, senderNumber, botNumber2, botNumber, pushname,
            isMe, isOwner, groupMetadata, groupName, participants, groupAdmins,
            isBotAdmins, isAdmins, reply,
          });
        } catch (e) {
          console.error("[PLUGIN ERROR]", e);
        }
      }
    }

    const replyText = body;
    for (const handler of replyHandlers) {
      if (handler.filter(replyText, { sender, message: mek })) {
        try {
          await handler.function(rush, mek, m, {
            from, quoted: mek, body: replyText, sender, reply,
          });
          break;
        } catch (e) {
          console.log("Reply handler error:", e);
        }
      }
    }
  });
}

ensureSessionFile();

app.get("/", (req, res) => {
  res.send("Hey, SQUID-GAME started✅");
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
