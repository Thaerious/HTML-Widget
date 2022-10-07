// Creates a new namespace directory in client-src
// Adds a widget.info file with link information

import FS from "fs";
import Path from "path";
import settings from "../settings.js";
import CONST from "../constants.js";
import log from "../setupLogger.js";
import { fsjson, mkdirif } from "@thaerious/utility"

function namespace (records, commands, args){
    createNamespace(commands.nextCommand());
}

/**
* Add the widget.info file to the package directory.
* The directory is 'client-src/pkg'.
* Only creates the file if it doesn't already exist.
* The default widget.info file contains only the link field.
*/
function createNamespace(packageName) {
    const widgetInfo = fsjson.load(settings['client-src'], packageName, CONST.WIDGET_INFO_FILE);
    const path = Path.join(settings['client-src'], packageName, CONST.WIDGET_INFO_FILE);

    if (!FS.existsSync(path)) {
        log.verbose(`  \\__ new namespace added ${path}`);
        fsjson.save(mkdirif(path), { ...widgetInfo, link: packageName });
    } else {
        log.veryverbose(`  \\__ namespace already exists ${path}`);
    }    
}

export { namespace as default, createNamespace };