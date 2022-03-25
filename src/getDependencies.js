import { parseHTML } from "linkedom";
import FS from "fs";
import Path from "path";
import loadJSON from "./loadJSON.js";
import CONSTANTS from "./constants.js";
import extractSettings from "./extractSettings.js";

/**
 * For a given view-record return all component-records that need to
 * be injected into the view.
 */
function getDependencies(rootRecord, records){
    const stack = [rootRecord];
    const visited = new Set();
    const settings = extractSettings();

    while(stack.length > 0){
        const record = stack.shift();
        
        if (record.view === ``) continue;
        const path = Path.join(record.dir.src, record.view);
        if (!FS.existsSync(path)) continue;
    
        const fileString = FS.readFileSync(path);
        const htmlString = `<html><body>${fileString}</body></html>`;
        const dom = parseHTML(htmlString);
        const template = dom.document.querySelector(`template`);

        for (const tagName in records) {
            const record = records[tagName];
            if (visited.has(record)) continue;
            if (template?.content.querySelector(record.tagName) || dom.window.document.querySelector(record.tagName)) {
                visited.add(record);
                stack.push(record);
            }
        }
    }

    return visited.values();
}

export default getDependencies;