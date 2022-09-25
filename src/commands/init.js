import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import { fsjson, mkdirif } from "@thaerious/utility"
import settings from "../settings.js";
import Logger from "@thaerious/logger";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
import { createReference } from "./reference.js";
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
    updateWidgetRC(args);
    addWidgetInfoFile(args.flags.package || settings.package);
    mkdirif(CONSTANTS.LOCATIONS.STATIC_DIR);
    createReference(CONSTANTS.MODULE_NAME);
}

/**
 * Create the .widgetrc file in the root directory.
 */
function addWidgetRC(args) {
    if (FS.existsSync(settings[`widget-rc`])) return;

    const widgetrc = {
        ...fsjson.load(settings[`widget-rc`]),
        ...{
            "output-dir": CONSTANTS.LOCATIONS.OUTPUT,
            "link-dir": CONSTANTS.LOCATIONS.LINK_DIR,
            src: `client-src`
        }
    };

    logger.channel(`verbose`).log(`  \\__ + ${settings[`widget-rc`]}`);
    logger.channel(`debug`).log(JSON.stringify(widgetrc, null, 2));
    fsjson.save(settings[`widget-rc`], widgetrc);
}

function updateWidgetRC(args) {
    const widgetrc = fsjson.load(settings[`widget-rc`]);
    if (args.flags.output) widgetrc[`output-dir`] = args.flags.output;
    if (args.flags.src) widgetrc.src = args.flags.src;

    logger.channel(`verbose`).log(`  \\__ + ${settings[`widget-rc`]}`);
    logger.channel(`debug`).log(JSON.stringify(widgetrc, null, 2));
    fsjson.save(settings[`widget-rc`], widgetrc);
}

/**
 * Add the widget.info file to the package directory.
 * The directory is 'client-src/pkg'.
 * Only creates the file if it doesn't already exist.
 * The default widget.info file contains only the link field.
 * @param {string} pkg The name of the package to add.
 */
function addWidgetInfoFile(pkg) {
    const widgetInfo = fsjson.load(settings['client-src'], pkg, CONSTANTS.WIDGET_INFO_FILE);
    const path = Path.join(settings['client-src'], pkg, CONSTANTS.WIDGET_INFO_FILE);

    if (!FS.existsSync(path)) {
        logger.channel(`verbose`).log(`  \\__ + ${path}`);
        fsjson.save(mkdirif(path), { ...widgetInfo, link: pkg });
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${path}`);
    }
}

export { init as default, addWidgetInfoFile, addWidgetRC as addwidgetrc };
