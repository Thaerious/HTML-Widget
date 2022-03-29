import discover from "./discover.js";

function records(records, commands, args) {
    if (Object.keys(records).length == 0){
        discover(records);
    }

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
