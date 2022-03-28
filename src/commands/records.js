
function records(records, commands, args) {
    if (commands.hasNext() && records[commands.peekCommand()]) {
        const name = commands.nextCommand();
        console.log(records[name]);
    } else {
        for (const tagname in records) {
            console.log(records[tagname]);
        }
    }
}

export default records;
