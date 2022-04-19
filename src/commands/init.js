import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
import settings from "../settings.js";
import Logger from "@thaerious/logger";
import mkdirIf from "../mkdirIf.js";
const logger = Logger.getLogger();

function init(records, commands, args) {
    addNidgetRC(args);
    addPackageInfo(args);    
}

function addNidgetRC(args) {
    let nidgetrc = {
        ...loadJSON(settings["nidget-rc"]),
        ...{
            "output-dir": CONSTANTS.LOCATIONS.OUTPUT,
            "link-dir": CONSTANTS.LOCATIONS.LINK_DIR,
            "src": "client-src"
        }
    }       

    if (args.flags["output"]) nidgetrc["output-dir"] = args.flags["output"];
    if (args.flags["src"]) nidgetrc["src"] = args.flags["src"];

    logger.channel(`very-verbose`).log(JSON.stringify(nidgetrc, null, 2));

    FS.writeFileSync(settings["nidget-rc"], JSON.stringify(nidgetrc, null, 2));
}

function addPackageInfo(args){
    const pkg = args.flags.package || settings["package"];

    const nidgetInfo = loadJSON(settings["src"], pkg, CONSTANTS.NIDGET_INFO_FILE);

    FS.writeFileSync(
        mkdirIf(settings["src"], pkg, CONSTANTS.NIDGET_INFO_FILE),
        JSON.stringify({...nidgetInfo, link : pkg}, null, 2)
    );
}

export default init;