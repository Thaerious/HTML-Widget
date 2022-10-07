import Path from "path";
import settings from "../settings.js";
import enumeratePackages from "../enumeratePackages.js";
import CONST from "../constants.js";
import {fsjson} from "@thaerious/utility";
import log from "../setupLogger.js";
import { EmptyCommandStackError } from "../cli.js";

function reference(records, commands, args) {
    try {
        createReference(commands.nextCommand(), args.flags[`path`]);
    } catch (error) {
        if (error instanceof EmptyCommandStackError) {
            helpReference();
        } else {
            throw error;
        }
    }
}

/**
 * Add a field to the imports in the root widget.info file.
 * These fields are used during the link phase to create filesystem dir
 * links from client-src/packagepath to www/linked/packageName.
 * If the path is omitted a search will take place looking for the package in
 * the node_modules directory.  When found, the most appropriate field will
 * be used for the path (see getTargetField below).
 * @param {*} packageName 
 * @param {*} packagePath 
 * @returns 
 */
function createReference(packageName, packagePath) {
    const widgetInfoPath = Path.join(settings['client-src'], CONST.WIDGET_INFO_FILE);
    let widgetInfo = fsjson.load(widgetInfoPath);
    if (!widgetInfo.imports) widgetInfo.imports = {};
    const packageMap = enumeratePackages();

    if (packagePath){
        widgetInfo.imports[packageName] = {
            path : packagePath
        }
    } else {
        const fullpath = Path.join(packageMap.get(packageName), settings[`package-json`]);
        const packageJSON = fsjson.load(fullpath);        
        const field = getTargetField(packageJSON);

        if (!field){
            widgetInfo.imports[packageName] = {
                path : Path.join("/", packageJSON.name),
            }  
        } else {
            widgetInfo.imports[packageName] = {
                path : Path.join("/", packageJSON.name),
                file : widgetInfo.imports[packageName] = Path.join("/", packageJSON.name, field.value)
            }              
        }
    }

    fsjson.save(widgetInfoPath, widgetInfo);
}

/**
 * Determine the target path by looking at package.json fields.
 * Precidence is given in this order:
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
    const keys = ["browser", "module", "main"];
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

function helpReference() {
    log.standard("COMMAND");
    log.standard("\treference - add a linked directory to www/linked");
    log.standard("");
    log.standard("SYNOPSIS");
    log.standard("\tnpx widget reference [NAME] [PATH]");
    log.standard("\tnpx widget reference [NAME]");
    log.standard("");
    log.standard("DESCRIPTION");
    log.standard("\tCreates an import entry in the client-src/widget.info file.");
    log.standard("\tThe build (link) command will then create a linked directory between");
    log.standard("\twww/linked/NAME to the value specified by PATH.");
    log.standard("\tIf the path variable is omitted then the node_modules/ directory");
    log.standard("\twill be searched for a package.json with a matching NAME.");
    log.standard("\tIf the package.json file has a valid file field then.");
    log.standard("\tThen the build (importmap) command will add NAME:PATH pair");
    log.standard("\tto the www/compiled/import_map.ejs file.");
    log.standard("\tValid file fields are: browser, module, main");
    log.standard("\t");
    log.standard("\tIf the package.json contains a widget field, the directory");
    log.standard("\tspecified there will treated as a widget client source directory.");
}

export {reference as default, createReference, helpReference};
