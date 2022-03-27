import Path from "path";
import FS from "fs";

export default function mkdirIf(...paths){
    const path = Path.join(...paths);

    if (!FS.existsSync(Path.parse(path).dir)){
        FS.mkdirSync(Path.parse(path).dir, { recursive: true });    
    }

    return path;
}