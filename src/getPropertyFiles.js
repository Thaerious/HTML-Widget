import FS from "fs";
import Path from "path";
import CONSTANTS from "./constants.js";

function getPropertyFiles(root = CONSTANTS.NODE_MODULES_PATH) {
    return processDirectory(root, [], 1);
}

function processDirectory(root, result, depth) {
    if (depth > 2) return result;

    const contents = FS.readdirSync(root, { withFileTypes: true });

    for (const dirEntry of contents) {
        if (dirEntry.isSymbolicLink()) {
            const realpath = FS.realpathSync(Path.join(root, dirEntry.name));
            const stat = FS.lstatSync(realpath);
            if (stat.isDirectory()) {
                processDirectory(realpath, result, depth + 1);
            }
        } else if (dirEntry.isDirectory()) {
            processDirectory(Path.join(root, dirEntry.name), result, depth + 1);
        } else {
            const path = Path.join(root, dirEntry.name);
            const fileEntry = Path.parse(path);
            fileEntry.full = Path.join(fileEntry.dir, fileEntry.base);   
            if (fileEntry.base === CONSTANTS.NIDGET_PROPERTY_FILE) result.push(fileEntry);
        }
    }

    return result;
}

export default getPropertyFiles;
