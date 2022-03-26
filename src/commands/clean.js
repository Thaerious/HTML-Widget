import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
import extractSettings from "../extractSettings.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

function clean(records, commands, args) {
    const settings = extractSettings();
    if (FS.existsSync(settings["output-dir"])) FS.rmSync(settings["output-dir"], {recursive : true});
    if (FS.existsSync(settings["link-dir"]))   FS.rmSync(settings["link-dir"], {recursive : true});
}

export default clean;