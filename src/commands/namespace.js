// Creates a new namespace directory in client-src
// Adds a widget.info file with link information

import FS from "fs";
import Path from "path";
import settings from "../settings.js";
import CONSTANTS from "../constants.js";
import log from "../setupLogger.js";
import { fsjson, mkdirif } from "@thaerious/utility"

function namespace (records, commands, args){
    createNamespace(commands.nextCommand());
}

function createNamespace(packageName) {
    const widgetInfo = fsjson.load(settings['client-src'], packageName, CONSTANTS.WIDGET_INFO_FILE);
    const path = Path.join(settings['client-src'], packageName, CONSTANTS.WIDGET_INFO_FILE);

    if (!FS.existsSync(path)) {
        log.verbose(`  \\__ + ${path}`);
        fsjson.save(mkdirif(path), { ...widgetInfo, link: packageName });
    } else {
        log.verbose(`  \\__ = ${path}`);
    }    
}

export default namespace;