var commands = [];
var replyHandlers = [];

function cmd(info, func) {
    const data = info;
    data.function = func;

    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!data.desc) data.desc = '';
    if (!data.category) data.category = 'misc';
    if (!data.filename) data.filename = "Not Provided";
    if (!data.fromMe) data.fromMe = false;

    if (!data.pattern && typeof data.filter === "function") {
        replyHandlers.push(data);
    } else {
        commands.push(data);
    }
    return data;
}

module.exports = { cmd, AddCommand: cmd, Function: cmd, Module: cmd, commands, replyHandlers };
