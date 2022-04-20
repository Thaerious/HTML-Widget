import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
import settings from "../settings.js";
import Logger from "@thaerious/logger";
import mkdirIf from "../mkdirIf.js";
const logger = Logger.getLogger();

function init(records, commands, args) {
    addwidgetrc(args);
    addPackageInfo(args);    
}

function addwidgetrc(args) {
    let widgetrc = {
        ...loadJSON(settings["widget-rc"]),
        ...{
            "output-dir": CONSTANTS.LOCATIONS.OUTPUT,
            "link-dir": CONSTANTS.LOCATIONS.LINK_DIR,
            "src": "client-src"
        }
    }       

    if (args.flags["output"]) widgetrc["output-dir"] = args.flags["output"];
    if (args.flags["src"]) widgetrc["src"] = args.flags["src"];
    
    if (!FS.existsSync(settings["widget-rc"])){
        logger.channel(`verbose`).log(`  \\__ + ${settings["widget-rc"]}`);    
        logger.channel(`debug`).log(JSON.stringify(widgetrc, null, 2));    
        FS.writeFileSync(settings["widget-rc"], JSON.stringify(widgetrc, null, 2));
    } else {
        logger.channel(`verbose`).log(`  \\__ x ${settings["widget-rc"]}`); 
    }
}

function addPackageInfo(args){
    const pkg = args.flags.package || settings["package"];
    const widgetInfo = loadJSON(settings["src"], pkg, CONSTANTS.NIDGET_INFO_FILE);
    const path = Path.join(settings["src"], pkg, CONSTANTS.NIDGET_INFO_FILE);

    if (!FS.existsSync(path)){
        logger.channel(`verbose`).log(`  \\__ + ${path}`); 
        mkdirIf(path);
        FS.writeFileSync(path, JSON.stringify({...widgetInfo, link : pkg}, null, 2));
    } else {
        logger.channel(`verbose`).log(`  \\__ x ${path}`); 
    }


}

export default init;