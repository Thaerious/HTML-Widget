import Path from "path";
import sass from "sass";
import FS from "fs";
import Logger from "@thaerious/logger";
import mkdirIf from "../mkdirIf.js";
import settings from "../settings.js";
const logger = Logger.getLogger();

/**
 * Compile sass files into css files and place then into 
 * the component and view output directories.
 */
function style(records, commands, args) {
    for (const name in records) {
        const record = records[name];
        logger.channel(`verbose`).log(`  \\_ ${record.package}:${name}`);   
        try {
            renderSCSS(record, settings);
        } catch (err) {
            logger.channel("standard").log(`Error in #sass`);
            logger.channel("standard").log(err);
            logger.channel("standard").log(JSON.stringify(record, null, 2));
        }
    }
}

function renderSCSS(record, settings){
    if (!record?.style?.src || !record?.style?.dest){
        logger.channel(`very-verbose`).log(`    \\_ skip`);   
        return;
    }

    logger.channel(`very-verbose`).log(`    \\_ ${record.package}:${record.fullName}`);   

    const src = Path.join(record.dir.src, record.style.src);
    const outpath = Path.join(record.dir.dest, record.style.dest);
    const result = sass.compile(src);

    if (result){
        mkdirIf(outpath);
        FS.writeFileSync(outpath, result.css); 
        logger.channel(`verbose`).log(`      \\_ ${src}`);
        logger.channel(`verbose`).log(`      \\_ ${outpath}`);
    }
}

export default style;