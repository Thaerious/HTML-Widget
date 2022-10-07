import FS from "fs";
import Path from "path";
import settings from "../settings.js";
import CONST from "../constants.js";
import {fsjson, mkdirif} from "@thaerious/utility";
import Logger from "@thaerious/logger";

const logger = Logger.getLogger();

/**
 * Build the import_map.ejs file from the 'client-src/widget.info' file.
 * 
 * @param {*} records 
 * @param {*} commands 
 * @param {*} args 
 * @returns 
 */
function importmap (records, commands, args){
    const imports = {};
    const widgetInfoPath = Path.join(settings['client-src'], CONST.WIDGET_INFO_FILE);
    let widgetInfo = fsjson.load(widgetInfoPath);
    if (!widgetInfo.imports) return;

    for (const name in widgetInfo.imports) {
        if (widgetInfo.imports[name].file) {
            imports[name] = widgetInfo.imports[name].file;
        }
    }

    const importMapPath = mkdirif(settings[`output-dir`], CONST.FILENAME.IMPORT_FILE);
    FS.writeFileSync(importMapPath, JSON.stringify({imports : imports}, null, 2));    
}

export default importmap;