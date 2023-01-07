import Path from "path";
import FS from "fs";
import CONST from "../constants.js";
import { fsjson, mkdirif } from "@thaerious/utility"
import Logger from "@thaerious/logger";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
import { createNamespace } from "./namespace.js";
import { createReference } from "./reference.js";
import settings, { reloadSettings } from "../settings.js";
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
    reloadSettings();

    createNamespace(args.flags.package || settings.package);
    mkdirif(CONST.LOCATIONS.STATIC_DIR);
    createReference(CONST.MODULE_NAME);
    defaultRoutes();
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
            "server-src": CONST.LOCATIONS.SERVER_SRC,
            "routes-dir": CONST.LOCATIONS.ROUTES_DIR,
            "node-modules": Path.join(CONST.NODE_MODULES_PATH),
            "package-json": Path.join(CONST.NODE_PACKAGE_FILE),
        },
        ...fsjson.load(CONST.WIDGET_PROPERTY_FILE)
    };

    logger.channel(`verbose`).log(`  \\__ + ${CONST.WIDGET_PROPERTY_FILE}`);
    fsjson.save(CONST.WIDGET_PROPERTY_FILE, widgetrc);
}

function defaultRoutes() {
    logger.channel(`verbose`).log(`  \\__ setting up default routes`);
    const fromDir = Path.join(settings["node-modules"], CONST.MODULE_NAME, CONST.DEFAULT_ROUTES);
    const toDir = mkdirif(settings["routes-dir"] + "/");
    const contents = FS.readdirSync(fromDir).sort();
   
    for (const entry of contents) {        
        const from = Path.join(fromDir, entry);
        const to = Path.join(toDir, entry);
        
        if (FS.existsSync(to)) {
            logger.channel(`veryverbose`).log(`  \\__ skipping: ${to}`);
            continue;  
        } 

        logger.channel(`veryverbose`).log(`  \\__ file: ${from}`);
        logger.channel(`verbose`).log(`  \\__ link: ${to}`);

        FS.cpSync(from, to);
    }        
}

export { init as default, addWidgetRC as addwidgetrc };
