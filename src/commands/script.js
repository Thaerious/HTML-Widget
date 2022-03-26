import FS from "fs";
import Path from "path";
import extractSettings from "../extractSettings.js";
import mkdirIf from "../mkdirIf.js";
import Logger from "@thaerious/logger";
import loadJSON from "../loadJSON.js";
import CONSTANTS from "../constants.js";

const logger = Logger.getLogger();

/**
* Link local .mjs files into linked directory under the package name.
*/
function script(records, commands, args) {
    const settings = extractSettings();

    const importMap = {
        imports : {}
    };

    for (const name in records) {
        const record = records[name];
        logger.channel(`verbose`).log(` \\__ ${record.package}:${name}`);   
        linkFile(record, "es6", settings, importMap);
    }

    const importMapPath = Path.join(settings[`output-dir`], CONSTANTS.LIB_FILE);
    FS.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
}

/**
 * Link the file under field for each record to the output directory.
 */
function linkFile(record, field, settings, importMap) {
    if (!FS.existsSync(record.dir.dest)) FS.mkdirSync(record.dir.dest, { recursive: true });
    if (record[field] === "") return;
    if (!record.package || record.package == settings.package) linkLocalFile(record, field, settings, importMap);
    else linkModuleFile(record, field, settings, importMap);
}

function linkModuleFile(record, field, settings, importMap) {
    const properties = loadJSON(CONSTANTS.NODE_MODULES_PATH, record.package, CONSTANTS.NIDGET_PROPERTY_FILE);

    let from = Path.join(record.dir.src, record.es6);
    const to = Path.join(record.dir.dest, record[field]);

    const relativePath = Path.relative(settings["output-dir"], record.dir.dest);
    importMap.imports[record.package] = Path.join("/", relativePath, record[field]);

    if (FS.existsSync(to)) FS.rmSync(to);
    mkdirIf(to);
    FS.linkSync(from, to);

    logger.channel(`very-verbose`).log(`    \\_ src ${from}`);
    logger.channel(`very-verbose`).log(`    \\_ dest ${to}`);
}

function linkLocalFile(record, field, settings, importMap) {
    let from = Path.join(record.dir.src, record[field]);
    const to = Path.join(record.dir.dest, record[field]);

    const relativePath = Path.relative(settings["output-dir"], record.dir.dest);
    importMap.imports[record.package] = Path.join("/", relativePath, record[field]);

    if (FS.existsSync(to)) FS.rmSync(to);
    mkdirIf(to);
    FS.linkSync(from, to);

    logger.channel(`very-verbose`).log(`    \\_ src ${from}`);
    logger.channel(`very-verbose`).log(`    \\_ dest ${to}`);

    return to;
}

export default script;
