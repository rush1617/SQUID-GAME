const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: "vJ8AFLaD#gI60XfNE5oge9HNuUnEu8PkgbEQli5rhL5DIyWKsqyU", // Put your session id here
  ALIVE_IMG: "https://github.com/rush1617/SQUID-GAME/blob/main/Images/Alive(2)%20.png?raw=true",
  ALIVE_MSG: `╔═══◉ *🟢 STATUS: ONLINE* ◉═══╗
║  𝙷𝚎𝚢 𝙳𝚞𝚍𝚎, 𝙸’𝚖 𝚑𝚎𝚛𝚎 𝚝𝚘 𝚑𝚎𝚕𝚙 𝚢𝚘𝚞.  
║  𝙰𝚜𝚔 𝚖𝚎 𝚊𝚗𝚢𝚝𝚑𝚒𝚗𝚐! 💬
╚══════════════════════╝

🧾 *PROFILE INFORMATION*
┌──────── ○△□ ────────┐
│ 🔐 *Owner:* Ramesh Dissanayaka  
│ 👤 *Botname:* SQUID-GAME  
│ ⚡ *Bio:* Powerful WhatsApp Bot  
│ 🧩 *Role:* Wizard Lord 🧙‍♂️  
└──────── ⋆⋅☆⋅⋆ ────────┘

🚀 Powered By *RAMESH*
*DISSANAYAKA* 💰`, // Change alive msg from here
  BOT_OWNER: "94726892483", // Replace your bot owner number here with 94(country code)
  ownerNumber: ["94726892483"], // Replace your bot owner number here (same as bot owner number)
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",

    };
