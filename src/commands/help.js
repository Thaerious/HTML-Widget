import FS from "fs";
import Path from "path";
import Logger from "@thaerious/logger";
import CONST from "../constants.js";
import settings from "../settings.js";

const logger = Logger.getLogger();

function help (records, commands, args) {
    const helpContext = commands.hasNext() ? commands.nextCommand() : `index`;
    const path = Path.join(settings[`node-modules`], CONST.MODULE_NAME, `help/${helpContext}.txt`);

    if (!FS.existsSync(path)) {
        logger.channel(`standard`).log(`Help for command '${helpContext}' not found.`);
        logger.channel(`veryverbose`).log(`${path}`);
    } else {
        const text = FS.readFileSync(path, `utf-8`);
        logger.channel(`standard`).log(text);
    }
}

export default help;
