import Path from "path";
import FS from "fs";

export default function loadJSON(...paths){
    const path = Path.join(...paths);
    if (!FS.existsSync(path)) return {};
    return JSON.parse(FS.readFileSync(Path.join(...paths))); 
}