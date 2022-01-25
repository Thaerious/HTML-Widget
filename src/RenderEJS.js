import ejs from "ejs";
import Path from "path";
import FS from "fs";
import Logger from "@thaerious/logger";
import CONSTANTS from "./constants.js";
const logger = Logger.getLogger();

function renderEJS (record, outputDirectory, localPkg) {
    const basename = Path.basename(record.view.slice(0, -4));
    logger.channel(`very-verbose`).log(`  \\_ source ${record.package}:${record.view}`); 

    const viewPaths = [];
    for (let include of record.includes){
        if(include.view){
            if (include.package === localPkg){
                const path = Path.join(process.cwd(), include.view);                
                viewPaths.push(path);
                logger.channel(`very-verbose`).log(`    \\_ include ${include.package}:${path}`);                 
            } else {
                const path = Path.join(process.cwd(), CONSTANTS.NODE_MODULES_PATH, include.package, include.view);
                viewPaths.push(path);
                logger.channel(`very-verbose`).log(`    \\_ include ${include.package}:${path}`); 
            }
        }
    }

    const dataobj = {
        viewPaths: viewPaths,
        modname: "",
        scriptname: "",
        stylename: ""
    };
    
    if (record.es6 !== "") dataobj.modname = record.name;
    if (record.script !== "") dataobj.scriptname = record.name;
    if (record.style !== "") dataobj.stylename = record.name;

    return new Promise((resolve, reject)=>{
        ejs.renderFile(
            record.view,
            dataobj,
            (err, str) => {
                if (err) {
                    reject(err)
                } else {
                    if (!FS.existsSync(outputDirectory)) {
                        FS.mkdirSync(outputDirectory, { recursive: true });
                    }
                    const outpath = Path.join(outputDirectory, basename + `.html`);
                    FS.writeFileSync(outpath, str);
                    logger.channel(`very-verbose`).log(`    \\_ destination ${outpath}`);
                    resolve();
                }
            }
        );
    })
}

export default renderEJS;
