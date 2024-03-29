import { parseHTML } from "linkedom";
import FS from "fs";
import Path from "path";
import ejs from "ejs";
import settings from "./settings.js";
import Logger from "@thaerious/logger";
import CONST from "./constants.js";

const logger = Logger.getLogger();

class DependencyError extends Error {
    constructor (message, record, error) {
        super(message);
        this.record = record;
        this.source = error;
    }
}

/**
 * For a given view-record return all component-records that need to
 * be injected into the view.
 */
async function getDependencies (rootRecord, records) {
    const stack = [rootRecord];
    const visited = new Set();

    while (stack.length > 0) {
        const record = stack.shift();
        logger.channel(`debug`).log(`  \\__ considering ${record.fullName}`);

        try {
            if (!record.view || record.view === ``) continue;            
            const path = Path.join(record.dir.src, record.view);
            if (!FS.existsSync(path)) continue;

            // Tranform the .ejs into .html to parse out nested components.
            const fileString = await render(path, record, record.data);
            const dom = parseHTML(fileString);
            const template = dom.document.querySelector(`template`);

            // For every record add record tagnames that match the element tagname
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
async function render (path, record, dataIn) {
    return new Promise((resolve, reject) => {
        const libFile = Path.join(settings[`output-dir`], CONST.FILENAME.IMPORT_FILE);
        const templateFile = Path.join(settings[`output-dir`], record.dir.sub, CONST.FILENAME.TEMPLATES);

        const data = {
            widget : {
                prebuild: true,
                lib_file: Path.resolve(libFile),
                template_file: Path.resolve(templateFile)
            },
            ...dataIn
        };

        ejs.renderFile(path, data, {}, function (err, str) {
            if (err) reject(err);
            resolve(str);
        });
    });
}

export { getDependencies as default, DependencyError };
