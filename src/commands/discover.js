import Path from "path";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import settings from "../settings.js";
import {seekfiles, fsjson} from "@thaerious/utility";
import getPropertyFiles from "../getPropertyFiles.js";
import loadRecords from "../loadRecords.js";

const logger = Logger.getLogger();

/**
 * Examine source directories (client-src) for components and views.
 * @param {Object} records a dictionary of name -> record
 * @param {Command} commands a Command object (see cli.js)
 * @param {ParseArgs} args a parseargs object (see @thaerious/parseargs)
 */
function discover (records, commands, args) {
    // discover local source
    _discover(records, settings['client-src'], settings);

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
    for (const record of loadRecords(path)){
        storeRecord(records, record);
        logger.channel(`veryverbose`).log(`    \\__ ${record.tagname}`);
    }
}

function storeRecord (records, record) {
    if (records[record.fullName]) {
        logger.channel(`warning`).log(`duplicate component: ${record.package}:${record.fullName}`);
    }

    records[record.fullName] = record;
    logger.channel(`verbose`).log(` \\__ ${record.package}:${record.fullName}`);
}

export default discover;
