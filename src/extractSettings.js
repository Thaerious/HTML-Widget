import CONSTANTS from "./constants.js";
import FS from "fs";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "./parseArgsOptions.js";
const args = new ParseArgs().loadOptions(parseArgsOptions).run();

/**
 * Load settings from the nidget.json file
 * Overwrite with command line settings
 **/
function extractSettings(filename = CONSTANTS.NIDGET_PROPERTY_FILE) {
    let settings = {
        package : ""
    };

    let fileSettings = {};
    if (FS.existsSync(filename)) {
        const settingsText = FS.readFileSync(filename);
        settings = JSON.parse(settingsText);
    }

    settings.outputPath = settings.outputPath ?? CONSTANTS.DEFAULT_OUTPUT;
    if (args.flags.output) settings.outputPath = args.flags.output;
    if (args.flags.dist) settings['package-dir'] = args.flags.dist;

    if (!FS.existsSync(settings.outputPath)) {
        FS.mkdirSync(settings.outputPath, { recursive: true });
    }
    
    if (FS.existsSync(CONSTANTS.NODE_PACKAGE_FILE)){
        const nodePkg = JSON.parse(FS.readFileSync(CONSTANTS.NODE_PACKAGE_FILE, "utf-8"));
        if (nodePkg.name) settings.package = nodePkg.name;
    }

    if (FS.existsSync(CONSTANTS.NODE_MODULES_PATH)){
        settings.modulesPath = CONSTANTS.NODE_MODULES_PATH;
    }

    return settings;
}

export default extractSettings;
