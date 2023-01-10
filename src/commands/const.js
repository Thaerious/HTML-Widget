import Logger from "@thaerious/logger";
import CONST from "../const.js";
const logger = Logger.getLogger();

async function printConst(records, commands, args) {
    logger.channel(`standard`).log(JSON.stringify(CONST, null, 2));
}

export default printConst;
