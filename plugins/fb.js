const { cmd, commands } = require("../command");
const getFbVideoInfo = require("@xaviabot/fb-downloader");

cmd(
  {
    pattern: "fb",
    alias: ["fb", "facebook"],
    react: "📘",
    desc: "Download Facebook Video",
    category: "download",
    filename: __filename,
  },
  async (
    rush,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*Please provide a valid Facebook video URL!* ❤️");

      const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/;
      if (!fbRegex.test(q))
        return reply("*Invalid Facebook URL! Please check and try again.* ☹️");

      reply("*Downloading your video...* ❤️");

      const result = await getFbVideoInfo(q);
      if (!result || (!result.sd && !result.hd)) {
        return reply("*Failed to download video. Please try again later.* ☹️");
      }

      const { title, sd, hd } = result;
      const bestQualityUrl = hd || sd;
      const qualityText = hd ? "HD" : "SD";

      const desc = `
          🌟 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 🌟    
════════════════════════     
🟦🟥  SQUID - GAME  🟦🟥  
      ✅ _FACEBOOK VIDEO DOWNLOADER_ ✅  
════════════════════════   

🚀 Pow. By *RAMESH DISSANAYAKA* 🔥
─────────────────────────
👻 *Title*: ${title || "Unknown"}
👻 *Quality*: ${qualityText}
─────────────────────────
🎼 Made with ❤️ by RAMESH DISSANAYAKA💫
`;

      await rush.sendMessage(
        from,
        {
          image: {
            url: "https://github.com/rush1617/SQUID-GAME/blob/main/Images/Fbdownloader.png?raw=true",
          },
          caption: desc,
        },
        { quoted: mek }
      );

      await rush.sendMessage(
        from,
        {
          video: { url: bestQualityUrl },
          caption: `*📥 Downloaded in ${qualityText} quality*`,
        },
        { quoted: mek }
      );

      return reply("✅ *Thank you for using SQUID - GAME!* 💖");
    } catch (e) {
      console.error(e);
      reply(`*Error:* ${e.message || e}`);
    }
  }
);
