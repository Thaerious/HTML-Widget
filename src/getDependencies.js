import { parseHTML } from "linkedom";
import FS from "fs";
import ejs from "ejs";
import Logger from "@thaerious/logger";
import { convert } from "@thaerious/utility";

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
 * be injected into the view.  Adds dependiencies to the dependency field
 * of each record.
 */
async function getDependencies (rootRecord, records) {
    const stack = [rootRecord];
    const visited = new Set();

    rootRecord.dependencies = [];

    while (stack.length > 0) {
        const record = stack.shift();
        visited.add(record.name);

        try {
            if (!FS.existsSync(record.path)) throw new Error("unknown path: " + record.path);

            // Tranform the .ejs into .html to parse out nested components.
            const fileString = await render(record.path, record);
            const dom = parseHTML(fileString);
            
            // For every record add record tagnames that match the element tagname
            for (const name in records) {     
                if (records[name].type != "component") continue;
                if (visited.has(name)) continue;

                if (dom.window.document.querySelector(convert.dash(name))) {                    
                    rootRecord.dependencies.push(name);
                    stack.push(records[name]);
                }
            }
        } catch (error) {
            throw new DependencyError(error.message, record, error);
        }
    }
}

/**
 * Render the html file to search for widgets.
 * Set ejs variable 'prebuild' to true which turns off injecting the template file.
 */
async function render(path, record, data = {}) {
    return new Promise((resolve, reject) => {
        data = { buildTemplates: () => { } }

        ejs.renderFile(path, data, {}, function (err, str) {
            if (err) reject(err);
            resolve(str);
        });
    });
}

export { getDependencies as default, DependencyError };
