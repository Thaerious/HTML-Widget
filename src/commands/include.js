import settings from "../settings.js";
import getDependencies, {DependencyError} from "../getDependencies.js";
import constants from "../constants.js";
import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import discover from "./discover.js";

import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

/**
 * Build the templates.mjs file for the views.
 */
async function include(records, commands, args) {
    if (Object.keys(records).length == 0){
        discover(records);
    }

    if (args && args.flags.view){
        try {
            await doInclude(settings, records[args.flags.view], records);
        } catch (error) {
            if (error instanceof DependencyError){
                console.error(error.source);
                console.error(error.record);
            }
            else {
                console.error(error);
            }
        }
        return;
    }    

    for (const tagName in records) {
        try {
            await doInclude(settings, records[tagName], records);
        } catch (error) {
            if (error instanceof DependencyError){
                console.error(error.source);
                console.error(error.record);
            }
            else {
                console.error(error);
            }
        }
    }
}

async function doInclude(settings, record, records) {
    if (record.type !== CONSTANTS.TYPE.VIEW) return;
    logger.channel("verbose").log(`  \\__ ${record.tagName}`);

    const dependencies = await getDependencies(record, records);
    const filename = Path.join(record.dir.dest, constants.FILENAME.TEMPLATES);
    logger.channel("very-verbose").log(`  \\__ dest ${filename}`);

    if (!FS.existsSync(record.dir.dest)) FS.mkdirSync(record.dir.dest, { recursive: true });
    const fp = FS.openSync(filename, "w");

    for (let dependency of dependencies) {
        logger.channel("very-verbose").log(`  \\__ dependency ${dependency.tagName}`);
        if (!dependency.view || dependency.view === "") continue;
        const dependencyFilename = Path.join(dependency.dir.src, dependency.view);
        const scriptPath = Path.relative(settings["output-dir"], Path.join(dependency.dir.dest, dependency.es6));
        FS.writeSync(fp, `<script type='module' src='/${scriptPath}'></script>\n`);
        FS.writeSync(fp, FS.readFileSync(dependencyFilename));
    }

    FS.close(fp);
}

export default include;
