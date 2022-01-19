import NidgetPreprocessor from "./NidgetPreprocessor.js";
import extractSettings from "./extractSettings.js";
import FS from "fs";
import CONSTANTS from "./constants.js";
import parseArgsOptions from "./parseArgsOptions.js";

import ParseArgs from "@thaerious/parseargs";
const args = new ParseArgs().loadOptions(parseArgsOptions).run();

import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

logger.channel(`standard`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`very-verbose`).enabled = false;
logger.channel(`debug`).enabled = false;

if (args.count(`silent`) > 0) logger.channel(`standard`).enabled = false;
if (args.count(`verbose`) >= 1) logger.channel(`verbose`).enabled = true;
if (args.count(`verbose`) >= 2) logger.channel(`very-verbose`).enabled = true;
if (args.count(`verbose`) >= 3) logger.channel(`debug`).enabled = true;

(() => {
    const nidgetPreprocessor = new NidgetPreprocessor();
    const settings = extractSettings();

    nidgetPreprocessor.package = settings.package;
    if (settings.modulesPath) nidgetPreprocessor.addModules(settings.modulesPath);    
    if (settings.input) for (const path of settings.input) nidgetPreprocessor.addPath(path);
    if (settings.exclude) for (const path of settings.exclude) nidgetPreprocessor.addExclude(path);

    nidgetPreprocessor.process();

    let nidgetProperties = {};
    if (FS.existsSync(CONSTANTS.NIDGET_PROPERTY_FILE)) {
        nidgetProperties = JSON.parse(FS.readFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, "utf-8"));
    }

    if (!nidgetProperties.records) nidgetProperties.records = {};

    const dictionary = nidgetPreprocessor.dictionary;

    for (const name in dictionary) {
        const record = dictionary[name];
        if (record.package === settings.package) nidgetProperties.records[name] = record;
    }

    if (args.flags["name"]) {
        console.log("\nObject");
        console.log(nidgetPreprocessor.getRecord(args.flags["name"]));
        console.log("\nJSON");
        console.log(nidgetPreprocessor.getRecord(args.flags["name"]).toJSON());
    }

    FS.writeFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, JSON.stringify(nidgetProperties, null, 2));
})();
