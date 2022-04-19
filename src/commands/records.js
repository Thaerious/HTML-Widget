import discover from "./discover.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

function records(records, commands, args) {
    if (Object.keys(records).length == 0){
        discover(records);
    }

    if (commands.hasNext() && records[commands.peekCommand()]) {
        const name = commands.nextCommand();
        logger.channel(`records`).log(JSON.stringify(records[name], null, 2));
    } else {
        for (const tagname in records) {
            logger.channel(`records`).log(JSON.stringify(records[tagname], null, 2));
        }
    }
}

export default records;
