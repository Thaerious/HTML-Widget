import FS from "fs";
import Path from "path";
import settings from "../settings.js";
import loadJSON from "../loadJSON.js";
import getPropertyFiles from "../getPropertyFiles.js";
import CONSTANTS from "../constants.js";
import mkdirIf from "../mkdirIf.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

/**
* Build the www/compiled/input_map.ejs file  from nidgetrc files.
*/
function import_map(records, commands, args) {
    const importMap = {
        imports : {}
    };

    // discover in packages
    for (const nidgetRCFileDesc of getPropertyFiles()) {          
        const nidgetRC = loadJSON(nidgetRCFileDesc.full);
        
        if (nidgetRC.module){
            const packageJSON = loadJSON(nidgetRCFileDesc.dir, settings["package-json"]);
            const libPath = Path.join("/", packageJSON.name, nidgetRC.module);
            importMap.imports[packageJSON.name] = libPath;
        }
    }

    const importMapPath = mkdirIf(settings[`output-dir`], CONSTANTS.FILENAME.LIB_FILE);
    FS.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
}

export default import_map;
