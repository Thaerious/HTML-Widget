import discover from "./discover.js";
import FS from "fs";

async function buildTemplates(name) {
    const records = await discover();  
    
    var t = "";
    for (const dependency of records[name].dependencies) {
        t = t + FS.readFileSync(records[dependency].path);
    }
    return t;
}

export default buildTemplates;