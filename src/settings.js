import CONSTANTS from "./constants.js";
import FS from "fs";
import Path from "path";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "./parseArgsOptions.js";
import loadJSON from "./loadJSON.js";
const args = new ParseArgs().loadOptions(parseArgsOptions).run();

/**
 * Load settings from the nidget.json file
 * Overwrite with command line settings
 **/
function extractSettings() {
    console.log("extractSettings");
    const cwd = args.flags.cwd || ".";
    const packageJSON = loadJSON(cwd, CONSTANTS.NODE_PACKAGE_FILE);

    const defaultSettings = {
        package : packageJSON?.name || "",
        "output-dir" : CONSTANTS.LOCATIONS.OUTPUT,
        "link-dir" : CONSTANTS.LOCATIONS.LINK_DIR,
        "src" : CONSTANTS.LOCATIONS.DEFAULT_SRC
    };

    let settings = {...defaultSettings, ...loadJSON(Path.join(cwd, CONSTANTS.NIDGET_PROPERTY_FILE))};

    return {
        "package-json" : Path.join(cwd, CONSTANTS.NODE_PACKAGE_FILE),
        "package" : settings.package,
        "output-dir" : Path.join(cwd, settings["output-dir"]),
        "link-dir" : Path.join(cwd, settings["link-dir"]),
        "src" : Path.join(cwd, settings["src"])
    };
}

let settings;
if (!settings) settings = extractSettings();
export default settings;
