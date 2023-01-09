import CONST from "./const.js";
import {seekfiles, fsjson} from "@thaerious/utility";
import getDependencies from "./getDependencies.js";

async function discover(records = {}) {    
    find(records);
    for (const name in records) {
        if (records[name].type !== "view") continue;
        await getDependencies(records[name], records);
    }
    return records;
}

/**
 * Recrusivly examine view and component directories for candidates.
 * A valid target is any directory that has an .ejs file that matches\
 * the top directory.
 * Each returned record consists of:
 *   name : string,
 *   path : string,
 *   type : {view, component}
 * @param {Object} records a dictionary of name -> record
 * @param {Command} commands a Command object (see cli.js)
 * @param {ParseArgs} args a parseargs object (see @thaerious/parseargs)
 */
function find(records) {
    const viewFiles = seekfiles(
        CONST.DIR.VIEWS,
        file => file.ext === ".ejs" && file.name == lastDir(file.dir)
    );

    for (const viewFile of viewFiles) {
        records[viewFile.name] = {
            name: viewFile.name,
            path: viewFile.full,
            type: "view"
        }
    }

    const compFiles = seekfiles(
        CONST.DIR.COMPONENTS,
        file => file.ext === ".ejs" && file.name == lastDir(file.dir)
    );

    for (const compFile of compFiles) {
        records[compFile.name] = {
            name: compFile.name,
            path: compFile.full,
            type: "component"
        }
    }    
}

function lastDir(path) {
    const split = path.split("/");
    if (split.length == 0) throw new Error("invalid path");
    return split[split.length - 1];
}

export default discover;
