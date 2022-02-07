import ejs from "ejs";
import Path from "path";
import FS from "fs";
import Logger from "@thaerious/logger";
import CONSTANTS from "./constants.js";
const logger = Logger.getLogger();
import mkdirIf from "./mkdirIf.js";
import { convertDelimited } from "./names.js";

function renderEJS(record, settings) {
    record.html = record.view.slice(0, -4) + ".html";
    logger.channel(`very-verbose`).log(`  \\_ source ${record.package}:${record.view}`);

    const viewPaths = [];
    const modPaths = [];
    const scriptPaths = [];

    for (let include of record.includes) {
        if (include.view) {
            const view = Path.join(process.cwd(), settings['input'], include.view);
            const style = include.style ? Path.join(include.package, include.style) : "";
            console.log(style);
            viewPaths.push({view: view, style: "/" + style});
        }
        if (include.es6) {
            const script = Path.join(include.package, include.es6);
            modPaths.push("/" + script);
            logger.channel(`very-verbose`).log(`    \\_ include ${include.package}:${script}`);
        }
        if (include.script) {
            const script = Path.join(include.package, include.script);
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
    if (record.script !== "") scriptPaths.push("/" + Path.join(record.package, record.script));
    if (record.style !== "") dataobj.stylename = "/" + Path.join(record.package, record.style);

    return new Promise((resolve, reject) => {
        const inputPath = Path.join(settings['input'], record.view);
        ejs.renderFile(inputPath, dataobj, (err, str) => {
            if (err) {
                reject(err);
            } else {
                const outpath = Path.join(settings[`output-dir`], record.package, record.html);
                mkdirIf(outpath);

                FS.writeFileSync(outpath, str);
                logger.channel(`very-verbose`).log(`    \\_ destination ${outpath}`);
                resolve();
            }
        });
    });
}

export default renderEJS;
