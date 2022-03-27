import FS from "fs";
import Path from "path";
import CONSTANTS from "./constants.js";
import settings from "./settings";

function getPropertyFiles() {
    return checkDirectory(settings["node-modules"]);
}

function checkDirectory(root, result = []) {
    if (FS.existsSync(Path.join(root, settings["package-json"]))) {
        processDirectory(root, result);
    } else {
        recurseDirectory(root, result);
    }
    return result;
}

function recurseDirectory(root, result) {    
    const dirContents = FS.readdirSync(root, { withFileTypes: true });
    for (const dirEntry of dirContents) {
        if (dirEntry.isSymbolicLink()) {
            const realpath = FS.realpathSync(Path.join(root, dirEntry.name));
            if (!FS.lstatSync(realpath).isDirectory()) continue
        }
        else if (!dirEntry.isDirectory()) continue;

        checkDirectory(Path.join(root, dirEntry.name), result);
    }
}

function processDirectory(root, result) {
    const propFilePath = Path.join(root, settings["nidget-rc"]);
    if (!FS.existsSync(propFilePath)) return;
    const fileEntry = Path.parse(propFilePath);
    fileEntry.full = Path.join(fileEntry.dir, fileEntry.base);
    result.push(fileEntry);
}

export default getPropertyFiles;
