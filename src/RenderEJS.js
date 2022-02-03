import ejs from "ejs";
import Path from "path";
import FS from "fs";
import Logger from "@thaerious/logger";
import CONSTANTS from "./constants.js";
const logger = Logger.getLogger();
import {convertDelimited} from "./names.js";

function renderEJS (record, settings) {
    const basename = Path.basename(record.view.slice(0, -4));
    logger.channel(`very-verbose`).log(`  \\_ source ${record.package}:${record.view}`); 

    const viewPaths = [];
    const modPaths = [];
    const scriptPaths = [];

    for (let include of record.includes){
        if(include.view){
            if (include.package === settings[`package`]){
                const view = Path.join(process.cwd(), include.view);                
                const style = Path.join(convertDelimited(include.name, '_') + ".css");
                viewPaths.push({view: view, style: style});
                logger.channel(`very-verbose`).log(`    \\_ local view ${include.package}:${view}`);                 
                logger.channel(`very-verbose`).log(`    \\_ local style ${include.package}:${style}`);                 
            } else {
                const view = Path.join(process.cwd(), CONSTANTS.NODE_MODULES_PATH, include.package, include.view);
                const style = Path.join(CONSTANTS.IMPORT_MAP_FILE_PATH, include.package, include.style);
                viewPaths.push({view: view, style: style});
                logger.channel(`very-verbose`).log(`    \\_ lib view ${include.package}:${view}`);                 
                logger.channel(`very-verbose`).log(`    \\_ lib style ${include.package}:${style}`);  
            }
        }
        if(include.es6){
            const filename = Path.parse(include.es6).base;
            const path = Path.join(filename);                
            modPaths.push(path);
            logger.channel(`very-verbose`).log(`    \\_ include ${include.package}:${path}`);                 
        }
        if(include.script){
            const filename = Path.parse(include.script).base;
            const path = Path.join(filename);                
            scriptPaths.push(path);
            logger.channel(`very-verbose`).log(`    \\_ include ${include.package}:${path}`);                 
        }
    }

    const dataobj = {
        viewPaths: viewPaths,
        modPaths: modPaths,
        scriptPaths: scriptPaths,
        scriptname: "",
        stylename: ""
    };
    
    if (record.es6 !== "") modPaths.push(Path.parse(record.es6).base);
    if (record.script !== "") scriptPaths.push(Path.parse(record.script).base);
    if (record.style !== "") dataobj.stylename = record.name;

    return new Promise((resolve, reject)=>{
        ejs.renderFile(
            record.view,
            dataobj,
            (err, str) => {
                if (err) {
                    reject(err)
                } else {
                    const outpath = Path.join(settings[`output-dir`], basename + `.html`);
                    const outdir = Path.parse(outpath).dir;
                    record.html = outpath;
                    if (!FS.existsSync(outdir)) FS.mkdirSync(outdir, { recursive: true });

                    FS.writeFileSync(outpath, str);
                    logger.channel(`very-verbose`).log(`    \\_ destination ${outpath}`);
                    resolve();
                }
            }
        );
    })
}

export default renderEJS;
