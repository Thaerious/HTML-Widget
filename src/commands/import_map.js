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
* Build the www/compiled/input_map.ejs file from .widgetrc files.
* Searches for property files (.widgetrc) in all packages.
*
* The .widgetrc file must contain the 'modules' field.  This will
* be appended to the package path resulting in the value of the 
* import statment.  The key will be the package name found in
* the package.json file.
*/
function import_map(records, commands, args) {
    const importMap = {
        imports : {}
    };

    // discover in packages
    for (const widgetrcFileDesc of getPropertyFiles()) {
        logger.channel("verbose").log(` \\__ ${widgetrcFileDesc.full}`);   
        const widgetrc = loadJSON(widgetrcFileDesc.full);
        
        if (widgetrc.module){
            const packageJSON = loadJSON(widgetrcFileDesc.dir, settings["package-json"]);
            const libPath = Path.join("/", packageJSON.name, widgetrc.module);
            importMap.imports[packageJSON.name] = libPath;
            logger.channel("verbose").log(`   \\__ ${packageJSON.name} : ${libPath}`);   
        }
    }

    const importMapPath = mkdirIf(settings[`output-dir`], CONSTANTS.FILENAME.LIB_FILE);
    FS.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));

    logger.channel("debug").log(JSON.stringify(importMap, null, 2));
}

export default import_map;
