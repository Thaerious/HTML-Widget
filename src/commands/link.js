import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";

async function link(records, commands, args){
    for (const tagName in records){
        const record = records[tagName];
        if (record.type !== CONSTANTS.TYPE.VIEW) continue;
        const from = Path.join(record.dir.src, record.view);
        const to = Path.join(record.dir.dest, record.view);
        
        if (FS.existsSync(to)) FS.rmSync(to);
        FS.linkSync(from, to);
    }
}

export default link;