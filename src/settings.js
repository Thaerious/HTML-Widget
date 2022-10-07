import CONST from "./constants.js";
import Path from "path";
import { fsjson } from "@thaerious/utility";

/**
 * @param {Object} defaults Values to inserted into settings.
 */
function reloadSettings (defaults = {}) {
    settings = fsjson.load(CONST.WIDGET_PROPERTY_FILE);
    return settings;
}

let settings;
if (!settings) settings = fsjson.load(CONST.WIDGET_PROPERTY_FILE);
export { settings as default, reloadSettings };
