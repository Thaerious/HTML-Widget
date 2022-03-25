import CONSTANTS from "./constants";
import FS from "fs";

/**
 * Examine .ejs files for each records and add a dependencies
 * field.  Fill record field with an array of records (reflective)
 * for each direct dependency.
 * 
 * Will overwrite previous dependencies.
 */
function fillDependencies(records){
    const dictionary = {};

    for (const record of records) {
        if (record.type === CONSTANTS.TYPE.COMPONENT){
            names.push(dictionary[tagName] = record);
        }
    }

    for (const record of records) {
        seekEJSDependencies(dictionary, record);
    }
}

/**
     * Get all dependencies for a single nidget ejs file.
     *
     * Adds any dependencies in the data-include attribute of the template (comma or space delimited).
     * Then searches for any tag-names that match any .ejs files in the nidgets subdirectory.
     */
 seekEJSDependencies(dictionary, record) {
    if (record.view === ``) return;
    if (!FS.existsSync(record.view)) return;
    
    const fileString = FS.readFileSync(record.view);
    const htmlString = `<html><body>${fileString}</body></html>`;
    const dom = parseHTML(htmlString);

    const template = dom.document.querySelector(`template`);

    if (template) {
        const includes = template.getAttribute(`data-include`) ?? ``;
        const split = includes.split(/[ ,]+/g);

        for (const s of split) {
            const dependencyName = s.trim();
            if (dependencyName !== ``) {
                if (dictionary[dependencyName]) {
                    addDependency(record, dictionary[dependencyName]);
                }
            }
        }
    }

    for (const depName in dictionary) {
        if (record.dependencies[depName]) continue;

        if (template?.content.querySelector(depName) || dom.window.document.querySelector(depName)) {
            addDependency(record, dictionary[depName]);
        }
    }
}

function addDependency(record, dependency){
    if (!record.dependencies[dependency.tagName]){
        record.dependencies[dependency.tagName] = dependency;
    }
}

export default fillDependencies;