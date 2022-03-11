import sass from "sass";
import FS from "fs";
import Logger from "@thaerious/logger";
import Path from "path";
import mkdirIf from "./mkdirIf.js";
import loadJSON from "./loadJSON.js";
import CONSTANTS from "./constants.js";
const logger = Logger.getLogger();

function renderSCSS(record, settings){
    if (record.style.src === "") return;
    if (record.package === settings.package) renderLocalSCSS(record, settings);
    else renderModuleSCSS(record, settings);
}

function renderLocalSCSS (record, settings) {
    logger.channel(`very-verbose`).log(`    \\_ ${record.package}:${record.tagName}`);   

    const src = Path.join(settings['input'],  record.path, record.style.src);
    const outpath = Path.join(settings['output-dir'],  record.path, record.style.dest);
    const result = sass.compile(src);

    if (result){
        mkdirIf(outpath);
        FS.writeFileSync(outpath, result.css); 
        logger.channel(`verbose`).log(`      \\_ ${src}`);
        logger.channel(`verbose`).log(`      \\_ ${outpath}`);
    }
}

function renderModuleSCSS (record, settings) {
    logger.channel(`very-verbose`).log(`    \\_ ${record.package}:${record.tagName}`);   

    const properties = loadJSON(CONSTANTS.NODE_MODULES_PATH, record.package, CONSTANTS.NIDGET_PROPERTY_FILE);
    const src = Path.join(CONSTANTS.NODE_MODULES_PATH, record.package, properties.input, record.path, record.style.src);
    const outpath = Path.join(settings['output-dir'], record.package, record.path, record.style.dest);
    const result = sass.compile(src);

    if (result){
        mkdirIf(outpath);
        FS.writeFileSync(outpath, result.css); 
        logger.channel(`verbose`).log(`      \\_ ${src}`);
        logger.channel(`verbose`).log(`      \\_ ${outpath}`);
    }
}

export default renderSCSS;
