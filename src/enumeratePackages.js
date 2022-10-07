import FS from "fs";
import Path from "path";
import CONST from "./constants.js";
import settings from "./settings.js";
import {fsjson} from "@thaerious/utility";

/**
 * Recrusivly check each subdirectory until a pacakge.json file is found.
 * When found add the package name and path to the returned map. 
 * */
function enumeratePackages(root = ".") {
    let stack = [Path.join(root, CONST.NODE_MODULES_PATH)];
    const map = new Map();

    while (stack.length > 0) {
        const path = stack.shift();
        const fullpath = Path.join(path, settings[`package-json`]);
        if (FS.existsSync(fullpath)) {
            const packageJSON = fsjson.load(fullpath);
            map.set(packageJSON.name, path);
        } else {
            stack = [...stack, ...recurseDirectory(path)];
        }
    }

    return map;
}

function recurseDirectory(root) {
    let stack = [];
    const dirContents = FS.readdirSync(root, { withFileTypes: true });
    for (const dirEntry of dirContents) {
        if (dirEntry.isSymbolicLink()) {
            const realpath = FS.realpathSync(Path.join(root, dirEntry.name));
            if (!FS.lstatSync(realpath).isDirectory()) continue;
            else stack.push(realpath);
        } else if (dirEntry.isDirectory()) {
            stack.push(Path.join(root, dirEntry.name));
        }
    }
    return stack;
}

export default enumeratePackages;
