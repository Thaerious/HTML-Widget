import FS from "fs";
import Path from "path";
import CONSTANTS from "../constants.js";
import settings from "../settings.js";
import {seekfiles, fsjson} from "@thaerious/utility";
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
async function link (records, commands, args) {    
    linkClientSrc(settings['client-src'], settings);    
    linkPackages();
}

function linkClientSrc (path, settings) {
    logger.channel(`veryverbose`).log(`  \\__ link client source (${path})`);
    const files = seekfiles(path, file => file.base === CONSTANTS.WIDGET_INFO_FILE);

    for (const file of files) {
        const widgetInfo = fsjson.load(file.full);

        if (widgetInfo.link) {
            logger.channel(`veryverbose`).log(`    \\__ link ${file.full}`);
            const link = Path.join(settings[`link-dir`], widgetInfo.link);
            const linkDir = Path.parse(link).dir;
            const src = Path.relative(linkDir, file.dir);

            if (!FS.existsSync(linkDir)) FS.mkdirSync(linkDir, { recursive: true });
            if (FS.existsSync(link)) FS.rmSync(link, { recursive: true });
            FS.symlinkSync(src, link);

            logger.channel(`debug`).log(`  \\__ path ${file.dir}`);
            logger.channel(`verbose`).log(`  \\__ src ${src}`);
            logger.channel(`verbose`).log(`  \\__ link ${link}`);
        }
    }
}

/**
 * Create a symlink in the www/linked directory for each 
 * package linked in the root widget.info file.
 * @param {*} packageJSON 
 */
function linkPackages(){
    logger.channel(`veryverbose`).log(`  \\__ link packages`);
    const widgetInfoPath = Path.join(settings['client-src'], CONSTANTS.WIDGET_INFO_FILE);
    let widgetInfo = fsjson.load(widgetInfoPath);
    if (!widgetInfo.imports) return;

    for (const name in widgetInfo.imports){
        const pkgPath = widgetInfo.imports[name].path;
        const fullpath = Path.join(CONSTANTS.NODE_MODULES_PATH, pkgPath, settings[`package-json`]);
        const pkgJSON = fsjson.load(fullpath);
        linkPackage(pkgJSON);
    }
}

function linkPackage (pkgJSON) {
    logger.channel(`veryverbose`).log(`    \\__ link ${pkgJSON.name}`);
    const from = Path.join(CONSTANTS.NODE_MODULES_PATH, pkgJSON.name);
    const to = Path.join(settings[`link-dir`], pkgJSON.name);

    if (!FS.existsSync(Path.parse(to).dir)) FS.mkdirSync(Path.parse(to).dir, { recursive: true });
    if (FS.existsSync(to)) FS.rmSync(to, { recursive: true });

    logger.channel(`verbose`).log(`  \\__ from ${from}`);
    logger.channel(`verbose`).log(`  \\__ to ${to}`);

    FS.symlinkSync(Path.resolve(from), to);
}

export default link;
