import { bfsObject } from "../bfsObject.js";
import settings from "../settings.js";
import getDependencies from "../getDependencies.js";
import constants from "../constants.js";
import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();


/**
 * Build the templates.mjs file for the views.
 * If the --view flag is presnet, build for only the specified view
 */
function include(records, commands, args){
    for (const tagName in records){
        doInclude(settings, records[tagName], records);
    }
}

function doInclude(settings, record, records){
    if (record.type !== CONSTANTS.TYPE.VIEW) return;
    logger.channel("verbose").log(`  \\__ ${record.tagName}`);
    
    const dependencies = getDependencies(record, records);
    const filename = Path.join(record.dir.dest, constants.FILENAME.TEMPLATES);
    logger.channel("very-verbose").log(`  \\__ dest ${filename}`);    

    if (!FS.existsSync(record.dir.dest)) FS.mkdirSync(record.dir.dest, {recursive : true});
    const fp = FS.openSync(filename, "w");

    for (let dependency of dependencies) {
        const dependencyFilename = Path.join(dependency.dir.src, dependency.view);
        const scriptPath = Path.relative(settings["output-dir"], Path.join(dependency.dir.dest, dependency.es6));
        FS.writeSync(fp, `<script type='module' src='${scriptPath}'></script>\n`);
        FS.writeSync(fp, FS.readFileSync(dependencyFilename));
    };

    FS.close(fp);
}

export default include;