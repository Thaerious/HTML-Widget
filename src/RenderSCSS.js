import sass from "sass";
import FS from "fs";
import Logger from "@thaerious/logger";
import Path from "path";
import mkdirIf from "./mkdirIf.js";
import {convertDelimited} from "./names.js";
const logger = Logger.getLogger();

function renderSCSS (record, settings) {
    logger.channel(`very-verbose`).log(`    \\_ ${record.package}:${record.style}`);   

    const outname = convertDelimited(record.name, `_`) + `.css`;
    const src = Path.join(settings['input'], record.style);
    const outpath = Path.join(settings['output-dir'],  settings.package, Path.parse(record.style).dir, outname);
    const result = sass.compile(src);

    record.style = Path.join(Path.parse(record.style).dir, outname);

    if (result){
        mkdirIf(outpath);
        FS.writeFileSync(outpath, result.css); 
        logger.channel(`verbose`).log(`    \\_ ${outpath}`);
    }
}

export default renderSCSS;
