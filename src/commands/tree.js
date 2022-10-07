import Path from "path";
import FS from "fs";
import log from "../setupLogger.js";
import CONST from "../constants.js";
import { mkdirif, seekfiles, fsjson } from "@thaerious/utility";
import discover from "./discover.js";

/**
 * Prebuild the output tree and default files.
 */
function tree(records, commands, args) {    
    if (Object.keys(records).length === 0) {
        discover(records);
    }
    
    for (const field in records) {
        const record = records[field];

        if (record.type == "view") {
            log.verbose(`    \\__ ${record.dir.sub}`);
            const templatesFilename = Path.join(record.dir.dest, CONST.FILENAME.TEMPLATES);
            mkdirif(templatesFilename);
            const fd = FS.openSync(templatesFilename, 'a');
            FS.closeSync(fd);
        }
    }
}

export default tree;