import Path from "path";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import settings from "../settings.js";
import {seekfiles, fsjson} from "@thaerious/utility";
import getPropertyFiles from "../getPropertyFiles.js";

const logger = Logger.getLogger();

/**
 * Examine source directories for components and views.
 * @param {Object} records a dictionary of name -> record
 * @param {Command} commands a Command object (see cli.js)
 * @param {ParseArgs} args a parseargs object (see @thaerious/parseargs)
 */
function discover (records, commands, args) {
    // discover local source
    _discover(records, settings.src, settings);

    // discover in packages
    for (const widgetrcFileDesc of getPropertyFiles()) {
        const widgetrc = fsjson.load(widgetrcFileDesc.full);
        logger.channel(`debug`).log(`    \\__ widgetrcFileDesc.full ${widgetrcFileDesc.full}`);
        logger.channel(`debug`).log(`    \\__ widgetrcFileDesc.dir ${widgetrcFileDesc.dir}`);
        logger.channel(`debug`).log(`    \\__ widgetrc.input ${widgetrc.input}`);

        _discover(records, Path.join(widgetrcFileDesc.dir, widgetrc.src), settings);
    }
}

function _discover (records, path, settings) {
    const files = seekfiles(path, file => file.base === CONSTANTS.WIDGET_INFO_FILE);

    for (const file of files) {
        const widgetInfo = fsjson.load(file.full);

        if (!widgetInfo.components) continue;
        for (const component of widgetInfo.components) {
            component.dir = component.dir || {};
            component.dir.src = component.dir.scr || file.dir;
            component.dir.dest = Path.join(settings[`output-dir`], component.package, component.fullName);
            storeRecord(records, component);

            logger.channel(`very-verbose`).log(`    \\__ ${file.full}`);
        }
    }
}

function storeRecord (records, component) {
    if (records[component.fullName]) {
        logger.channel(`warning`).log(`duplicate component: ${component.package}:${component.fullName}`);
    }

    records[component.fullName] = component;
    logger.channel(`verbose`).log(` \\__ ${component.package}:${component.fullName}`);
}

export default discover;
