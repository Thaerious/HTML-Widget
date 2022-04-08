import { parseHTML } from "linkedom";
import FS from "fs";
import Path from "path";

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
function getDependencies(rootRecord, records) {
    const stack = [rootRecord];
    const visited = new Set();

    while (stack.length > 0) {
        const record = stack.shift();

        try {
            if (!record.view || record.view === ``) continue;
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
        } catch (error) {
            throw new DependencyError(error.message, record, error);
        }
    }

    return visited.values();
}

export {getDependencies as default, DependencyError};
