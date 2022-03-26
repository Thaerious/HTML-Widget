import FS from "fs";
import Path from "path";

const p = Path.join("path", "to", "nowhere");
const q = Path.parse(p);
console.log(q);