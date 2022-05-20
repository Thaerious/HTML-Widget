import Path from "path";
import FS from "fs";

/**
 * If it doesn't exist, create a the directory from the conjoined paths variable.
 * The path is assumed to be to a file unless it is terminated with "/".
 * Returns joined path.
 */
export default function mkdirIf (...paths) {
    const path = Path.join(...paths);

    if (path.endsWith(`/`)) {
        if (!FS.existsSync(path)) {
            FS.mkdirSync(path, { recursive: true });
        }
    } else {
        const parsed = Path.parse(path);

        if (!parsed.dir || parsed.dir === ``) return path;

        if (!FS.existsSync(parsed.dir)) {
            FS.mkdirSync(parsed.dir, { recursive: true });
        }
    }

    return path;
}
