import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import settings from "../settings.js";
import loadJSON from "../loadJSON.js";
import seekFiles from "../seekFiles.js";
import Logger from "@thaerious/logger";

const logger = Logger.getLogger();

/**
 * Recursively creates dir links in the /linked directory for every 
 * directory in 'client-src' that has a widget.info file with a link
 * field.
 * 
 * The name of the link is the value in the link field of the widget-info
 * file.  By default the directory name.
*/
async function link(records, commands, args){    
    discover(settings["src"], settings);
}

function discover(path, settings) {     
    logger.channel("very-verbose").log(`  \\__ path ${path}`);   
    const files = seekFiles(path, file => file.base === CONSTANTS.WIDGET_INFO_FILE);

    for (const file of files) {
        logger.channel("debug").log(`    \\__ file ${JSON.stringify(file, null, 2)}`);   
        const widgetInfo = loadJSON(file.full);

        if (widgetInfo.link){
            logger.channel("very-verbose").log(`    \\__ link ${file.full}`);   
            const link = Path.join(settings["link-dir"], widgetInfo.link);            
            const linkDir = Path.parse(link).dir;
            const src = Path.relative(linkDir, file.dir);

            if (!FS.existsSync(linkDir)) FS.mkdirSync(linkDir, {recursive : true});
            if (FS.existsSync(link)) FS.rmSync(link, {recursive : true});
            FS.symlinkSync(src, link);

            logger.channel("debug").log(`  \\__ path ${file.dir}`);
            logger.channel("verbose").log(`  \\__ src ${src}`);
            logger.channel("verbose").log(`  \\__ link ${link}`);
        }
    }
}

export default link;