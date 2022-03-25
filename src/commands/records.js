
function init(records, commands, args) {
    if (commands.hasNext() && records[commands.peekCommand()]) {
        console.log(records[commands.nextCommand()])
    } else {
        for (const tagname in records) {
            console.log(records[tagname]);
        }
    }
}

export default init;
