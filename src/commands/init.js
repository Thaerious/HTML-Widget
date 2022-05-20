import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
import settings from "../settings.js";
import Logger from "@thaerious/logger";
import mkdirIf from "../mkdirIf.js";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
const logger = Logger.getLogger();

/**
 * Examine source directories for components and views.
 * @param {Object} records a dictionary of name -> record
 * @param {Command} commands a Command object (see cli.js)
 * @param {ParseArgs} args a parseargs object (see @thaerious/parseargs)
 */
function init(records, commands, args) {
    args = args || new ParseArgs().loadOptions(parseArgsOptions).run();
    addwidgetrc(args);
    addWidgetInfoFile(args.flags.package || settings["package"]);
    mkdirIf(CONSTANTS.LOCATIONS.STATIC_DIR);
}

/**
 * Create the .widgetrc file in the root directory.
 */
function addwidgetrc(args) {    
    let widgetrc = {
        ...loadJSON(settings["widget-rc"]),
        ...{
            "output-dir": CONSTANTS.LOCATIONS.OUTPUT,
            "link-dir": CONSTANTS.LOCATIONS.LINK_DIR,
            "src": "client-src"
        }
    }

    // update .widgetrc with command line flags.
    if (args.flags["output"]) widgetrc["output-dir"] = args.flags["output"];
    if (args.flags["src"]) widgetrc["src"] = args.flags["src"];
    
    if (!FS.existsSync(settings["widget-rc"])){
        logger.channel(`verbose`).log(`  \\__ + ${settings["widget-rc"]}`);    
        logger.channel(`debug`).log(JSON.stringify(widgetrc, null, 2));
        FS.writeFileSync(settings["widget-rc"], JSON.stringify(widgetrc, null, 2));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${settings["widget-rc"]}`); 
    }
}

/**
 * Add the widget.info file to the package directory.
 * The directory is 'client-src/pkg'.
 * Only creates the file if it doesn't already exist.
 * The default widget.info file contains only the link field.
 * @param {string} pkg The name of the package to add.
 */
function addWidgetInfoFile(pkg){
    const widgetInfo = loadJSON(settings["src"], pkg, CONSTANTS.WIDGET_INFO_FILE);
    const path = Path.join(settings["src"], pkg, CONSTANTS.WIDGET_INFO_FILE);

    if (!FS.existsSync(path)){
        logger.channel(`verbose`).log(`  \\__ + ${path}`); 
        mkdirIf(path);
        FS.writeFileSync(path, JSON.stringify({...widgetInfo, link : pkg}, null, 2));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${path}`); 
    }
}

export {init as default, addWidgetInfoFile, addwidgetrc}