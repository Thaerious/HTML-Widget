import FS from "fs";
import Path from "path";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
import extractSettings from "../extractSettings.js";
import replaceInFile from "../replaceInFile.js";
import { bfsObject } from "../bfsObject.js";
import { convertToDash, convertToPascal, convertDelimited } from "../names.js";
const logger = Logger.getLogger();

function help(records, commands, args) {
    const helpContext = commands.nextCommand() || "index";
    const path = Path.join(CONSTANTS.NODE_MODULES_PATH, CONSTANTS.MODULE_NAME, `help/${helpContext}.txt`);
    console.log(path);
    if (!FS.existsSync(path)) {
        logger.channel("standard").log(`Help for command '${helpContext}' not found.`);
    } else {
        const text = FS.readFileSync(path, "utf-8");
        logger.channel("standard").log(text);
    }
}

export default help;
