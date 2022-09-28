import Path from "path";
import settings from "./settings.js";
import Logger from "@thaerious/logger";
import { seekfiles, fsjson } from "@thaerious/utility";
import CONSTANTS from "./constants.js";

const logger = Logger.getLogger();

/**
 * Load all widget.config files as records from path.
 * @param {*} path 
 * @returns an array of records
 */
function loadRecords(path) {
    const records = [];
    const files = seekfiles(path, file => file.base === CONSTANTS.WIDGET_INFO_FILE);

    for (const file of files) {
        const widgetInfo = fsjson.load(file.full);

        if (!widgetInfo.components) continue;
        for (const component of widgetInfo.components) {
            component.dir = component.dir || {};
            component.dir.src = component.dir.scr || file.dir;
            component.dir.dest = Path.join(settings[`output-dir`], component.package, component.fullName);
            records.push(component);

            logger.channel(`veryverbose`).log(`    \\__ ${file.full}`);
        }
    }

    return records;
}
export default loadRecords;