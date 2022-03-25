import ejs from "ejs";
import Path from "path";
import FS from "fs";
import Logger from "@thaerious/logger";
import CONSTANTS from "./constants.js";
const logger = Logger.getLogger();
import mkdirIf from "./mkdirIf.js";

/**
 * Build the include file for html template injection.
 */
function renderEJS(record, includes, settings) {    
    record.html = record.view.slice(0, -4) + ".html";
    logger.channel(`verbose`).log(`  \\_ source ${record.package}:${record.view}`);

    const viewPaths = [];
    const modPaths = [];
    const scriptPaths = [];

    for (let include of includes) {
        if (include.view) {
            const view = Path.join(process.cwd(), settings['input'], include.path, include.view);
            const style = include.style.dest ? Path.join(include.path, include.style.dest) : "";
            viewPaths.push({view: view, style: "/" + style});
        }
        if (include.es6) {
            const script = Path.join(include.package, include.es6);
            modPaths.push("/" + script);
            logger.channel(`very-verbose`).log(`    \\_ include ${include.package}:${script}`);
        }
        if (include.script) {
            const script = Path.join("/", include.path, include.script);
            scriptPaths.push("/" + script);
            logger.channel(`very-verbose`).log(`    \\_ include ${include.package}:${script}`);
        }
    }

    const dataobj = {
        viewPaths: viewPaths,
        modPaths: modPaths,
        scriptPaths: scriptPaths,
        scriptname: "",
        stylename: "",
    };

    if (record.es6 !== "") modPaths.push("/" + Path.join(record.package, record.es6));
    if (record.script !== "") scriptPaths.push("/" + Path.join(record.package, record.es6));
    if (record?.style?.dest !== "") dataobj.stylename = "/" + Path.join(record.package, record.style.dest);

    return new Promise((resolve, reject) => {
        const inputPath = Path.join(settings['input'], record.path, record.view);
        ejs.renderFile(inputPath, dataobj, (err, str) => {
            if (err) {
                reject(err);
            } else {
                const outpath = Path.join(settings[`output-dir`], record.path, record.html);
                mkdirIf(outpath);

                FS.writeFileSync(outpath, str);
                logger.channel(`very-verbose`).log(`    \\_ destination ${outpath}`);
                resolve();
            }
        });
    });
}

export default renderEJS;
