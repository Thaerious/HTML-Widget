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
function import_packages(records, commands, args) {
    const importMap = {
        imports : {}
    };

    // discover in packages
    for (const packageFile of getPropertyFiles(CONSTANTS.NODE_PACKAGE_FILE)) {
        logger.channel("verbose").log(` \\__ ${packageFile.full}`);   
        const packageJSON = loadJSON(packageFile.full);
        
        if (packageJSON.browser){
            importMap.imports["/" + packageJSON.name] = Path.join(packageJSON.name, packageJSON.browser);
            linkPackage(packageJSON);
        }
    }

    const importMapPath = mkdirIf(settings[`output-dir`], CONSTANTS.FILENAME.LIB_FILE);
    FS.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));

    logger.channel("debug").log(JSON.stringify(importMap, null, 2));
}

function linkPackage(packageJSON){
    logger.channel("very-verbose").log(`    \\__ link ${packageJSON.name}`);   
    const from = Path.join(CONSTANTS.NODE_MODULES_PATH, packageJSON.name);
    const to = Path.join(settings["link-dir"], packageJSON.name);

    if (!FS.existsSync(Path.parse(to).dir)) FS.mkdirSync(Path.parse(to).dir, {recursive : true});
    if (FS.existsSync(to)) FS.rmSync(to, {recursive : true});

    logger.channel("verbose").log(`  \\__ from ${from}`);
    logger.channel("verbose").log(`  \\__ to ${to}`);

    FS.symlinkSync(Path.resolve(from), to);
}

export default import_packages;
