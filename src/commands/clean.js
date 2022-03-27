import FS from "fs";

function clean(records, commands, args) {
    const settings = extractSettings();
    if (FS.existsSync(settings["output-dir"])) FS.rmSync(settings["output-dir"], {recursive : true});
    if (FS.existsSync(settings["link-dir"]))   FS.rmSync(settings["link-dir"], {recursive : true});
}

export default clean;