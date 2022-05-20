import Path from "path";
import FS from "fs";
import mkdirIf from "./mkdirIf.js";

function loadJSON (...paths) {
    const path = Path.join(...paths);
    if (!FS.existsSync(path)) return {};
    return JSON.parse(FS.readFileSync(Path.join(...paths)));
}

function saveJSON (path, json) {
    FS.writeFileSync(mkdirIf(path), JSON.stringify(json, null, 2));
}

function writeFileField (path, key, value) {
    const json = loadJSON(path);
    json[key] = value;
    saveJSON(path, json);
}

export { loadJSON as default, saveJSON, writeFileField };
