import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import settings from "../settings.js";
import getPropertyFiles from "../getPropertyFiles.js";
import loadJSON from "../loadJSON.js";
import seekFiles from "../seekFiles.js";
import Logger from "@thaerious/logger";

const logger = Logger.getLogger();

/**
 * Search node_modules for directories with a nidget.info file
 * that contains a "link" field.
 * 
 * Link that directory under the value found.
 * Will only search packages with a .nidgetrc file.
 */
async function link_packages(records, commands, args){
    _discover(settings["src"], settings);

    for (const nidgetRCFileDesc of getPropertyFiles()) {          
        const nidgetRC = loadJSON(nidgetRCFileDesc.full);
        _discover(Path.join(nidgetRCFileDesc.dir, nidgetRC.src), settings);
    }
}

function _discover(path, settings) {        
    const files = seekFiles(path, file => file.base === CONSTANTS.NIDGET_INFO_FILE);

    for (const file of files) {
        const nidgetInfo = loadJSON(file.full);
        if (nidgetInfo.link){
            const link = Path.join(settings["link-dir"], nidgetInfo.link);            
            const linkDir = Path.parse(link).dir;
            const src = Path.relative(linkDir, path);

            if (!FS.existsSync(linkDir)) FS.mkdirSync(linkDir, {recursive : true});
            if (FS.existsSync(link)) FS.rmSync(link, {recursive : true});

            logger.channel("verbose").log(`  \\__ src ${src}`);
            logger.channel("verbose").log(`  \\__ link ${link}`);
            FS.symlinkSync(src, link);
        }
    }
}

export default link_packages;