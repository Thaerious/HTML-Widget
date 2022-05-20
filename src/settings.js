import CONSTANTS from "./constants.js";
import Path from "path";
import loadJSON from "./loadJSON.js";

/**
 * Load settings from the widget.json file
 * Overwrite with command line settings
 **/
function extractSettings () {
    const packageJSON = loadJSON(CONSTANTS.NODE_PACKAGE_FILE);

    const defaultSettings = {
        package: packageJSON?.name || ``,
        "output-dir": CONSTANTS.LOCATIONS.OUTPUT,
        "link-dir": CONSTANTS.LOCATIONS.LINK_DIR,
        src: CONSTANTS.LOCATIONS.DEFAULT_SRC
    };

    const settings = { ...defaultSettings, ...loadJSON(Path.join(CONSTANTS.WIDGET_PROPERTY_FILE)) };

    return {
        "node-modules": Path.join(CONSTANTS.NODE_MODULES_PATH),
        "package-json": Path.join(CONSTANTS.NODE_PACKAGE_FILE),
        "widget-rc": Path.join(CONSTANTS.WIDGET_PROPERTY_FILE),
        package: settings.package,
        "output-dir": Path.join(settings[`output-dir`]),
        "link-dir": Path.join(settings[`link-dir`]),
        src: Path.join(settings.src)
    };
}

/**
 * @param {Object} defaults Values to inserted into settings.
 */
function reloadSettings (defaults = {}) {
    settings = extractSettings();
    for (const key of Object.keys(defaults)) {
        settings[key] = defaults[key];
    }
    return settings;
}

let settings;
if (!settings) settings = extractSettings();
export { settings as default, reloadSettings };
