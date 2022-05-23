import FS from "fs";
import Path from "path";
import settings from "../settings.js";
import {fsjson} from "@thaerious/utility";
import getPropertyFiles from "../getPropertyFiles.js";
import CONSTANTS from "../constants.js";
import {mkdirif} from "@thaerious/utility";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

/**
* Builds the import map file and links packages from node_modules to /linked.
* 
* Every package.json file with either a 'browser' field, or a 'module' field 
* will have a link created to the value of that filed in the /linked directory.
* It will also be given an entry in the import map.  This entry will have the
* key as the package name, and the value as the entry in the browser/module field.
*
* Node: The browser field takes precedence over the module field.
*/
function importPackages (records, commands, args) {
    const importMap = {
        imports: {}
    };

    // discover in packages
    for (const packageFile of getPropertyFiles(CONSTANTS.NODE_PACKAGE_FILE)) {
        logger.channel(`verbose`).log(` \\__ ${packageFile.full}`);
        const packageJSON = fsjson.load(packageFile.full);

        if (typeof packageJSON.name !== `string`) continue;
        
        let moduleLoc = undefined;
        if (typeof packageJSON.browser === 'string') moduleLoc = packageJSON.browser;
        else if (typeof packageJSON.module === 'string') moduleLoc = packageJSON.module;
        else continue;

        importMap.imports[packageJSON.name] = Path.join(`/`, packageJSON.name, moduleLoc);
        linkPackage(packageJSON);
    }

    const importMapPath = mkdirif(settings[`output-dir`], CONSTANTS.FILENAME.LIB_FILE);
    FS.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));

    logger.channel(`debug`).log(JSON.stringify(importMap, null, 2));
}

function linkPackage (packageJSON) {
    logger.channel(`very-verbose`).log(`    \\__ link ${packageJSON.name}`);
    const from = Path.join(CONSTANTS.NODE_MODULES_PATH, packageJSON.name);
    const to = Path.join(settings[`link-dir`], packageJSON.name);

    if (!FS.existsSync(Path.parse(to).dir)) FS.mkdirSync(Path.parse(to).dir, { recursive: true });
    if (FS.existsSync(to)) FS.rmSync(to, { recursive: true });

    logger.channel(`verbose`).log(`  \\__ from ${from}`);
    logger.channel(`verbose`).log(`  \\__ to ${to}`);

    FS.symlinkSync(Path.resolve(from), to);
}

export default importPackages;
