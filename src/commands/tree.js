import Path from "path";
import FS from "fs";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import settings from "../settings.js";
import { mkdirif, seekfiles, fsjson } from "@thaerious/utility";
import loadRecords from "../loadRecords.js";

/**
 * Prebuild the output tree and default files.
 * Uses widget.config files so isn't dependent on 'discover'.
 */
function tree(records, commands, args) {
    
    for (const record of loadRecords(settings.src)){
        if (record.type == "view"){
            const templatesFilename = Path.join(record.dir.dest, CONSTANTS.FILENAME.TEMPLATES);
            mkdirif(templatesFilename);
            const fd = FS.openSync(templatesFilename, 'a');
            FS.closeSync(fd);
        }
    }
}

export default tree;