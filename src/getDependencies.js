import { parseHTML } from "linkedom";
import FS from "fs";
import Path from "path";
import loadJSON from "./loadJSON.js";
import CONSTANTS from "./constants.js";

/**
 * For a given view-record return all component-records that need to
 * be injected into the view.
 */
function getDependencies(rootRecord, npp){
    const stack = [rootRecord];
    const visited = new Set();

    while(stack.length > 0){
        const record = stack.shift();
        
        if (record.view === ``) continue;
        const path = viewPath(record, npp);
        if (!FS.existsSync(path)) continue;
    
        const fileString = FS.readFileSync(path);
        const htmlString = `<html><body>${fileString}</body></html>`;
        const dom = parseHTML(htmlString);
        const template = dom.document.querySelector(`template`);

        for (const record of npp.records) {
            if (visited.has(record)) continue;
            if (template?.content.querySelector(record.tagName) || dom.window.document.querySelector(record.tagName)) {
                visited.add(record);
                stack.push(record);
            }
        }
    }

    return visited.values();
}

function viewPath(rec, npp){
    if (rec.package === npp.package){
        return Path.join(npp.settings["input"], rec.path, rec.view);
    }
    else {
        const properties = loadJSON(CONSTANTS.NODE_MODULES_PATH, rec.package, CONSTANTS.NIDGET_PROPERTY_FILE);
        return Path.join(CONSTANTS.NODE_MODULES_PATH, rec.package, properties.input, rec.path, rec.view);
    }
}

export default getDependencies;