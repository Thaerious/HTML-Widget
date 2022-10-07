import settings from "../settings.js";
import getDependencies, { DependencyError } from "../getDependencies.js";
import FS from "fs";
import Path from "path";
import CONST from "../constants.js";
import discover from "./discover.js";

import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

/**
 * Build the templates.mjs file for each of the views.
 * 
 * 
 */
async function templates (records, commands, args) {
    if (Object.keys(records).length === 0) {
        discover(records);
    }

    // Only build for the view specified by --view flag
    if (args && args.flags.view) {
        try {
            await doTemplate(settings, records[args.flags.view], records);
        } catch (error) {
            if (error instanceof DependencyError) {
                console.error(error.source);
                console.error(error.record);
            } else {
                console.error(error);
            }
        }
        return;
    }

    // for each record by name (default)
    for (const fullName in records) {
        try {
            await doTemplate(settings, records[fullName], records);
        } catch (error) {
            if (error instanceof DependencyError) {
                console.error(error.source);
                console.error(error.record);
            } else {
                console.error(error);
            }
        }
    }
}

async function doTemplate (settings, record, records) {
    if (record.type !== CONST.TYPE.VIEW) return;
    logger.channel(`verbose`).log(`  \\__ ${record.fullName}`);

    const dependencies = await getDependencies(record, records);
    const templatesFilename = Path.join(record.dir.dest, CONST.FILENAME.TEMPLATES);
    logger.channel(`veryverbose`).log(`  \\__ dest ${templatesFilename}`);

    if (!FS.existsSync(record.dir.dest)) FS.mkdirSync(record.dir.dest, { recursive: true });
    const fp = FS.openSync(templatesFilename, `w`);

    for (const dependency of dependencies) {
        logger.channel(`veryverbose`).log(`  \\__ dependency ${dependency.fullName}`);
        if (!dependency.view || dependency.view === ``) continue;
        const dependencyFilename = Path.join(dependency.dir.src, dependency.view);
        const scriptPath = Path.relative(settings[`output-dir`], Path.join(dependency.dir.dest, dependency.es6));
        FS.writeSync(fp, `<script type='module' src='/${scriptPath}'></script>\n`);
        FS.writeSync(fp, FS.readFileSync(dependencyFilename));
    }

    FS.close(fp);
}

export default templates;
