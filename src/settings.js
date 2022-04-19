import CONSTANTS from "./constants.js";
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
    const packageJSON = loadJSON(CONSTANTS.NODE_PACKAGE_FILE);

    const defaultSettings = {
        package : packageJSON?.name || "",
        "output-dir" : CONSTANTS.LOCATIONS.OUTPUT,
        "link-dir" : CONSTANTS.LOCATIONS.LINK_DIR,
        "src" : CONSTANTS.LOCATIONS.DEFAULT_SRC
    };

    let settings = {...defaultSettings, ...loadJSON(Path.join(CONSTANTS.NIDGET_PROPERTY_FILE))};

    return {
        "node-modules" : Path.join(CONSTANTS.NODE_MODULES_PATH),
        "package-json" : Path.join(CONSTANTS.NODE_PACKAGE_FILE),
        "nidget-rc" : Path.join(CONSTANTS.NIDGET_PROPERTY_FILE),
        "package" : settings.package,
        "output-dir" : Path.join(settings["output-dir"]),
        "link-dir" : Path.join(settings["link-dir"]),
        "src" : Path.join(settings["src"])
    };
}

let settings;
if (!settings) settings = extractSettings();
export default settings;
