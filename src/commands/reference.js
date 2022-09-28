import FS from "fs";
import Path from "path";
import settings from "../settings.js";
import enumeratePackages from "../enumeratePackages.js";
import CONSTANTS from "../constants.js";
import {fsjson} from "@thaerious/utility";
import log from "../setupLogger.js";

function reference (records, commands, args){
    createReference(commands.nextCommand(), args.flags[`path`]);
}

function createReference(packageName, packagePath) {
    const widgetInfoPath = Path.join(settings['client-src'], CONSTANTS.WIDGET_INFO_FILE);
    let widgetInfo = fsjson.load(widgetInfoPath);
    if (!widgetInfo.imports) widgetInfo.imports = {};
    const packageMap = enumeratePackages();

    if (packagePath){
        widgetInfo.imports[packageName] = packagePath;
    } else {
        const fullpath = Path.join(packageMap.get(packageName), settings[`package-json`]);
        const packageJSON = fsjson.load(fullpath);        
        const field = getTargetField(packageJSON);

        if (!field){
            console.log(fullpath);
            log.error(`package.json for '${packageName}' missing valid field`);
            log.verbose(JSON.stringify(packageJSON, null, 2));
            return;
        }

        widgetInfo.imports[packageName] = {
            path : Path.join("/", packageJSON.name),
            file : widgetInfo.imports[packageName] = Path.join("/", packageJSON.name, field.value)
        }        
    }

    fsjson.save(widgetInfoPath, widgetInfo);
}

/**
 * Determine the target path by looking at package.json fields.
 * Precidence is given in this order:
 *  - widget
 *  - browser
 *  - module
 *  - main
 * 
 * Returns an object with two values
 *  - key
 *  - value
 * 
 * Returns undefined if no field is found
 */
function getTargetField(obj){
    const keys = ["widget", "browser", "module", "main"];
    for (const key of keys){
        if (typeof obj[key] == `string`){
            return {
                key : key,
                value : obj[key]
            }
        }
    }

    return undefined;
}

export {reference as default, createReference};
