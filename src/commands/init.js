import Path from "path";
import CONST from "../constants.js";
import { fsjson, mkdirif } from "@thaerious/utility"
import Logger from "@thaerious/logger";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
import { createNamespace } from "./namespace.js";
import { createReference } from "./reference.js";
import {reloadSettings} from "../settings.js";
const logger = Logger.getLogger();

/**
 * Examine source directories for components and views.
 * @param {Object} records a dictionary of name -> record
 * @param {Command} commands a Command object (see cli.js)
 * @param {ParseArgs} args a parseargs object (see @thaerious/parseargs)
 */
function init(records, commands, args) {
    args = args || new ParseArgs().loadOptions(parseArgsOptions).run();
    addWidgetRC(args);
    const settings = reloadSettings();

    createNamespace(args.flags.package || settings.package);
    mkdirif(CONST.LOCATIONS.STATIC_DIR);
    createReference(CONST.MODULE_NAME);
}

/**
 * Create the .widgetrc file in the root directory.
 * This file contains all the project settings.
 * It will initially contain defaults from constants.js
 */
function addWidgetRC(args) {
    const packageJSON = fsjson.load(CONST.NODE_PACKAGE_FILE);

    const widgetrc = {        
        ...{
            "package": packageJSON?.name || ``,
            "output-dir": CONST.LOCATIONS.OUTPUT,
            "link-dir": CONST.LOCATIONS.LINK_DIR,
            "client-src": CONST.LOCATIONS.CLIENT_SRC,
            "server-dir": CONST.LOCATIONS.SERVER,
            "node-modules": Path.join(CONST.NODE_MODULES_PATH),
            "package-json": Path.join(CONST.NODE_PACKAGE_FILE),
        },
        ...fsjson.load(CONST.WIDGET_PROPERTY_FILE)
    };

    logger.channel(`verbose`).log(`  \\__ + ${CONST.WIDGET_PROPERTY_FILE}`);
    fsjson.save(CONST.WIDGET_PROPERTY_FILE, widgetrc);
}

export { init as default, addWidgetRC as addwidgetrc };
