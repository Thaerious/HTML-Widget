import { parseHTML } from "linkedom";
import FS from "fs";
import Path from "path";
import ejs from "ejs";
import settings from "./settings.js";
import Logger from "@thaerious/logger";
import CONSTANTS from "./constants.js";

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
        logger.channel("debug").log(`  \\__ considering ${record.fullName}`);

        try {       
            if (!record.view || record.view === ``) continue;
            const path = Path.join(record.dir.src, record.view);
            if (!FS.existsSync(path)) continue;

            const fileString = await render(path, record);      
            const dom = parseHTML(fileString);
            const template = dom.document.querySelector(`template`);

            for (const fullName in records) {
                const record = records[fullName];
                if (visited.has(record)) continue;
                if (!record.tagName) continue;
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

/**
 * Render the html file to search for widgets.
 * Set ejs variable 'prebuild' to true which turns off injecting the template file.
 */
async function render(path, record){
    return new Promise((resolve, reject)=>{

        const lib_file = Path.join(settings['output-dir'], CONSTANTS.FILENAME.LIB_FILE);
        const template_file = Path.join(settings['output-dir'], record.dir.sub, CONSTANTS.FILENAME.TEMPLATES);

        const data = {
            prebuild : true,
            lib_file : Path.resolve(lib_file),
            template_file : Path.resolve(template_file)
        };

        ejs.renderFile(path, data, {}, function(err, str){
            if (err) reject(err);
            resolve(str);
        });
    });
}

export {getDependencies as default, DependencyError};
