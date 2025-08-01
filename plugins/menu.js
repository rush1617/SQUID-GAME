const { cmd } = require("../command");

cmd(
  {
    pattern: "menu",
    react: "⚙️",
    filename: __filename,
  },
  async (rush, mek, m, { from, reply }) => {
    try {
      const menuText = `
╭━━ ⚡ *SQUID-GAME*⚡ ━━╮
┃  💠 *Ｍ Ａ Ｉ Ｎ - Ｍ Ｅ Ｎ Ｕ* 💠
┃        ────୨ৎ────
╰➤ 📥 *DOWNLOAD* — Type: .download
╰➤ 🎨 *LOGO* — Type: .logo
╰➤ 👥 *GROUP* — Type: .group
╰➤ 🛠️ *UTILITIES* — Type: .utilities
╰➤ 🧰 *TOOLS* — Type: .tools
╰➤ 🤖 *AI* — Type: .ai
╰➤ 🔄 *CONVERT* — Type: .convert
╰➤ 🍥 *ANIME* — Type: .anime
╰➤ 🔍 *SEARCH* — Type: .search
╰➤ 🎉 *FUN* — Type: .fun
╰➤ 🏠 *MAIN* — Type: .main
╰➤ 👑 *OWNER* — Type: .owner
╰➤ 📂 *OTHER* — Type: .other
┃━━━━━━━━━━━━━━━━━━━━━✦
┃ ⚙️ Made with ❤️ by
╰─🔥 *_RAMESH DISSANAYAKA_* 🔥
      `.trim();

      // Photo eke path eka / url eka denna
      const imageUrl = "https://github.com/rush1617/SQUID-GAME/blob/main/Images/main-menu.png?raw=true"; // <-- Replace with your image URL

      await rush.sendMessage(from, {
        image: { url: imageUrl },
        caption: menuText,
      }, { quoted: mek });

    } catch (err) {
      console.error(err);
      reply("❌ Error generating menu.");
    }
  }
);
