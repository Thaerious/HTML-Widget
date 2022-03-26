import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
import extractSettings from "../extractSettings.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

function init(records, commands, args) {
    addNidgetRC(args);
    addPackageInfo();    
}

function addNidgetRC(args) {
    let nidgetrc = {
        ...loadJSON(CONSTANTS.NIDGET_PROPERTY_FILE),
        ...{
            "output-dir": CONSTANTS.LOCATIONS.OUTPUT,
            "nidget-src": "client-src",
            "view-src": "client-src",
            "src": "client-src"
        }
    }       

    if (args.flags["output"]) nidgetrc["output-dir"] = args.flags["output"];
    if (args.flags["src"]) nidgetrc["src"] = args.flags["src"];
    if (args.flags["nidget-src"]) nidgetrc["nidget-src"] = args.flags["nidget-src"];
    if (args.flags["view-src"]) nidgetrc["view-src"] = args.flags["view-src"];

    logger.channel(`very-verbose`).log(JSON.stringify(nidgetrc, null, 2));

    FS.writeFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, JSON.stringify(nidgetrc, null, 2));
}

function addPackageInfo(){
    const settings = extractSettings();
    const nidgetInfo = loadJSON(settings["src"], CONSTANTS.NIDGET_INFO_FILE);

    FS.writeFileSync(
        Path.join(settings["src"], CONSTANTS.NIDGET_INFO_FILE),
        JSON.stringify({...nidgetInfo, link : settings.package}, null, 2)
    );
}

export default init;