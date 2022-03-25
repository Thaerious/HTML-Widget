import { bfsObject } from "../bfsObject.js";
import extractSettings from "../extractSettings.js";
import getDependencies from "../getDependencies.js";
import constants from "../constants.js";
import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";

/**
 * Build the include file for a view.
 * If the --all flag is present build for all views.
 */
async function include(records, commands, args){
    const settings = extractSettings();

    if (!args.flags.view){
        for (const tagName in records){
            await doInclude(settings, records[tagName], records);
        }
    } else {
        const viewName = commands.nextCommand();
        const record = bfsObject(records, "tagName", viewName);
        if (!record) throw new Error(`Unknown view: ${viewName}`);    
        await doInclude(settings, record, records);
    }
}

async function doInclude(settings, record, records){
    if (record.type !== CONSTANTS.TYPE.VIEW) return;
    const dependencies = getDependencies(record, records);
    const filename = Path.join(record.dir.dest, constants.FILENAME.TEMPLATES);
        
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