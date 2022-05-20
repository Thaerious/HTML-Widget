import FS from "fs";
import Path from "path";

/**
 * Search root and all subdirectories for files that pass 'test'.
 * Test is passed a fileEntry from FS, with the full path appended.
 */
function seekFiles (roots, test, result = []) {
    for (const root of [roots].flat()) {
        processDirectory(root, test, result);
    }

    return result;
}

function processDirectory (root, test, result) {
    const contents = FS.readdirSync(root, { withFileTypes: true });

    for (const dirEntry of contents) {
        if (dirEntry.isSymbolicLink()) {
            const realpath = FS.realpathSync(Path.join(root, dirEntry.name));
            const stat = FS.lstatSync(realpath);
            if (stat.isDirectory()) {
                processDirectory(realpath, test, result);
            }
        } else if (dirEntry.isDirectory()) {
            processDirectory(Path.join(root, dirEntry.name), test, result);
        } else {
            const path = Path.join(root, dirEntry.name);
            const fileEntry = Path.parse(path);
            fileEntry.full = Path.join(fileEntry.dir, fileEntry.base);
            if (test(fileEntry)) result.push(fileEntry);
        }
    }

    return result;
}

export default seekFiles;
