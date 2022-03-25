import FS from "fs";
import Path from "path";
import constants from "../src/constants.js";
import loadJSON from "./loadJSON.js";

function getFiles(root, result, ...extensions) {
    extensions = extensions.flat();

    for (const extension of extensions) {
        result[extension] = result[extension] ?? [];
    }

    const roots = [root].flat();

    for (const root of roots){
        processDirectory(root, result, extensions);
    }

    return result;
}

function processDirectory(root, result, extensions) {

    const rcPath = Path.join(root, constants.NIDGET_PROPERTY_FILE);
    let inputs = [""];

    if (FS.existsSync(rcPath)) {
        const rcLocal = loadJSON(rcPath);
        inputs = rcLocal.input ?? inputs;
    }

    for (const input of inputs) {
        const localPath = Path.join(root, input);
        const contents = FS.readdirSync(localPath, { withFileTypes: true });
        for (const dirEntry of contents) {
            processEntry(dirEntry, localPath, result, extensions);
        }
    }

    return result;
}

function processEntry(dirEntry, root, result, extensions) {
    if (dirEntry.isSymbolicLink()) {
        const realpath = FS.realpathSync(Path.join(root, dirEntry.name));
        const stat = lstatSync(realpath);
        if (!stat.isDirectory()) {
            processDirectory(realpath, result, extensions);
        }
    } else if (dirEntry.isDirectory()) {
        processDirectory(Path.join(root, dirEntry.name), result, extensions);
    } else {
        processFile(root, dirEntry.name, result, extensions);
    }
}

function processFile(root, filename, result, extensions) {
    for (const extension of extensions) {
        if (filename.endsWith(`${extension}`)) {
            const path = Path.join(root, filename);
            const entry = Path.parse(path);
            entry.full = Path.join(entry.dir, entry.base);
            result[extension].push(entry);
            return;
        }
    }
}

export default getFiles;
