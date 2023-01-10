import discover from "../discover.js";
import Logger from "@thaerious/logger";
import FS from "fs";
import CONST from "../const.js";
const logger = Logger.getLogger();

async function records(records, commands, args) {
    if (!FS.existsSync(CONST.DIR.VIEWS)) return;
    if (Object.keys(records).length === 0) await discover(records);
    logger.channel(`records`).log(JSON.stringify(records, null, 2));
}

export default records;
