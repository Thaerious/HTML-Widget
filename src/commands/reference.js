import FS from "fs";
import Path from "path";
import settings from "../settings.js";
import enumeratePackages from "../enumeratePackages.js";
import CONSTANTS from "../constants.js";
import {fsjson} from "@thaerious/utility";
import Logger from "@thaerious/logger";

const logger = Logger.getLogger();

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
        
        if (!packageJSON.browser && !packageJSON.module){
            console.log(fullpath);
            logger.channel("error").log(`package.json for '${packageName}' missing browser or module field`);
            return;
        }

        const moduleField = packageJSON.browser ? packageJSON.browser : packageJSON.module;

        widgetInfo.imports[packageName] = {
            path : Path.join("/", packageJSON.name),
            file : widgetInfo.imports[packageName] = Path.join("/", packageJSON.name, moduleField)
        }        
    }

    fsjson.save(widgetInfoPath, widgetInfo);
}

export {reference as default, createReference};
