import FS from "fs";
import Path from "path";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
const logger = Logger.getLogger();

function init(records, commands, args) {
    let nidgetrc;
    if (FS.existsSync(CONSTANTS.NIDGET_PROPERTY_FILE)){
        nidgetrc = loadJSON(CONSTANTS.NIDGET_PROPERTY_FILE);
    } else {
        nidgetrc = loadJSON(
            Path.join(
                "node_modules", 
                CONSTANTS.MODULE_NAME, 
                "templates", 
                CONSTANTS.NIDGET_PROPERTY_FILE));
    }

    if (args.flags["output"]) nidgetrc["output-dir"] = args.flags["output"];
    if (args.flags["input"]) nidgetrc["src"] = args.flags["input"];
    if (args.flags["nidget-src"]) nidgetrc["nidget-src"] = args.flags["nidget-src"];
    if (args.flags["view-src"]) nidgetrc["view-src"] = args.flags["view-src"];

    logger.channel(`very-verbose`).log(JSON.stringify(nidgetrc, null, 2));

    FS.writeFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, JSON.stringify(nidgetrc, null, 2));
}

export default init;