import Path from "path";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
import extractSettings from "../extractSettings.js";
import seekFiles from "../seekFiles.js";
import getPropertyFiles from "../getPropertyFiles.js";

const logger = Logger.getLogger();

/**
 * Examine source directories for components and views.
 */
function discover(records, commands, args){
    const settings = extractSettings();
    _discover(records, settings.input, settings);

    // discover in packages
    for (const propertyFile of getPropertyFiles()) {         
        const properties = loadJSON(propertyFile.full);
        _discover(records, Path.join(propertyFile.dir, properties.input), settings);
    }
}

function _discover(records, path, settings) {        
    const files = seekFiles(path, file => file.base === CONSTANTS.NIDGET_INFO_FILE);

    for (const file of files) {
        const nidgetInfo = loadJSON(file.full);

        for (const component of nidgetInfo.components) {
            component.dir = {src : file.dir};

            component.dir.dest = component.package === settings.package  
            ? Path.join(settings["output-dir"], component.package, component.tagName)
            : Path.join(settings["output-dir"], component.package)

            storeRecord(records, component);
        }
    }
}

function storeRecord(records, component){
    if (records[component.tagName]){
        logger.channel("warning").log(`duplicate component: ${component.package}:${component.tagName}`);
    }

    records[component.tagName] = component;
    logger.channel("verbose").log(` \\__ ${component.package}:${component.tagName}`);
    logger.channel("debug").log(JSON.stringify(component, null, 2));    
}

export default discover;