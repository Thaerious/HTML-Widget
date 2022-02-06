import Path from "path";
import FS from "fs";

export default function mkdirIf(path){
    if (!FS.existsSync(Path.parse(path).dir)){
        FS.mkdirSync(Path.parse(path).dir, { recursive: true });    
    }
}