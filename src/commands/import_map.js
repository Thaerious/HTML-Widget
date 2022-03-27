import FS from "fs";
import Path from "path";
import extractSettings from "../extractSettings.js";
import Logger from "@thaerious/logger";
import loadJSON from "../loadJSON.js";
import getPropertyFiles from "../getPropertyFiles.js";
import CONSTANTS from "../constants.js";
import mkdirIf from "../mkdirIf.js";

const logger = Logger.getLogger();

/**
* Build the www/compiled/input_map.ejs file  from nidgetrc files.
*/
function import_map(records, commands, args) {
    const settings = extractSettings();

    const importMap = {
        imports : {}
    };

    // discover in packages
    for (const nidgetRCFileDesc of getPropertyFiles()) {          
        const nidgetRC = loadJSON(nidgetRCFileDesc.full);
        
        if (nidgetRC.module){
            const packageJSON = loadJSON(nidgetRCFileDesc.dir, CONSTANTS.NODE_PACKAGE_FILE);
            const libPath = Path.join(nidgetRCFileDesc.dir, nidgetRC.module);
            importMap.imports[packageJSON.name] = libPath;
        }
    }

    const importMapPath = mkdirIf(settings[`output-dir`], CONSTANTS.LIB_FILE);
    FS.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
}

export default import_map;
