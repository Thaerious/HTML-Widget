import FS from "fs";
import settings from "../settings.js";

function clean (records, commands, args) {
    if (FS.existsSync(settings[`output-dir`])) FS.rmSync(settings[`output-dir`], { recursive: true });
    if (FS.existsSync(settings[`link-dir`])) FS.rmSync(settings[`link-dir`], { recursive: true });
}

export default clean;
