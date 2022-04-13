import { parseHTML } from "linkedom";
import FS from "fs";
import Path from "path";
import ejs from "ejs";

import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

class DependencyError extends Error {
    constructor(message, record, error) {
        super(message);
        this.record = record;
        this.source = error;
    }
}

/**
 * For a given view-record return all component-records that need to
 * be injected into the view.
 */
async function getDependencies(rootRecord, records) {
    const stack = [rootRecord];
    const visited = new Set();

    while (stack.length > 0) {
        const record = stack.shift();
        logger.channel("debug").log(`  \\__ considering ${record.tagName}`);

        try {            
            if (!record.view || record.view === ``) continue;
            const path = Path.join(record.dir.src, record.view);
            if (!FS.existsSync(path)) continue;

            const fileString = await render(path);      

            const dom = parseHTML(fileString);
            const template = dom.document.querySelector(`template`);

            for (const tagName in records) {
                logger.channel("debug").log(`    \\__ tagname ${tagName}`);
                const record = records[tagName];
                if (visited.has(record)) continue;
                if (template?.content.querySelector(record.tagName) || dom.window.document.querySelector(record.tagName)) {
                    visited.add(record);
                    stack.push(record);
                }
            }
        } catch (error) {
            throw new DependencyError(error.message, record, error);
        }
    }

    return visited.values();
}

async function render(path){
    return new Promise((resolve, reject)=>{
        ejs.renderFile(path, {prebuild : true}, {}, function(err, str){
            if (err) reject(err);
            resolve(str);
        });
    });
}

export {getDependencies as default, DependencyError};
