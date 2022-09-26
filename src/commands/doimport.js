import FS from "fs";
import Path from "path";
import settings from "../settings.js";
import CONSTANTS from "../constants.js";
import {fsjson, mkdirif} from "@thaerious/utility";
import Logger from "@thaerious/logger";

const logger = Logger.getLogger();

function doimport (records, commands, args){
    const imports = {};
    const widgetInfoPath = Path.join(settings['client-src'], CONSTANTS.WIDGET_INFO_FILE);
    let widgetInfo = fsjson.load(widgetInfoPath);
    if (!widgetInfo.imports) return;

    for (const name in widgetInfo.imports){
        imports[name] = widgetInfo.imports[name].file;
    }

    const importMapPath = mkdirif(settings[`output-dir`], CONSTANTS.FILENAME.LIB_FILE);
    FS.writeFileSync(importMapPath, JSON.stringify({imports : imports}, null, 2));    
}

export default doimport;