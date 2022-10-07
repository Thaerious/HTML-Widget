import FS from "fs";
import Path from "path";
import settings from "./settings.js";
import CONST from "./constants.js";

function getPropertyFiles (filename = CONST.WIDGET_PROPERTY_FILE) {
    return checkDirectory(settings[`node-modules`], [], filename);
}

function checkDirectory (root, result, filename) {
    if (FS.existsSync(Path.join(root, settings[`package-json`]))) {
        processDirectory(root, result, filename);
    } else {
        recurseDirectory(root, result, filename);
    }
    return result;
}

function recurseDirectory (root, result, filename) {
    const dirContents = FS.readdirSync(root, { withFileTypes: true });
    for (const dirEntry of dirContents) {
        if (dirEntry.isSymbolicLink()) {
            const realpath = FS.realpathSync(Path.join(root, dirEntry.name));
            if (!FS.lstatSync(realpath).isDirectory()) continue;
        } else if (!dirEntry.isDirectory()) continue;

        checkDirectory(Path.join(root, dirEntry.name), result, filename);
    }
}

function processDirectory (root, result, filename) {
    const propFilePath = Path.join(root, filename);
    if (!FS.existsSync(propFilePath)) return;
    const fileEntry = Path.parse(propFilePath);
    fileEntry.full = Path.join(fileEntry.dir, fileEntry.base);
    result.push(fileEntry);
}

export default getPropertyFiles;
