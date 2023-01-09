import Path from "path";
import sass from "sass";
import FS from "fs";
import { mkdirif } from "@thaerious/utility";
import ParseArgs from "@thaerious/parseargs";
import CONST from "../../const.js";
const args = new ParseArgs().run();

function style(src = CONST.DIR.VIEWS, dest = CONST.DIR.COMPILED) {
    return (req, res, next) => {
        const destParsed = Path.parse(req.originalUrl);
        const scssPath = Path.join(src, destParsed.dir, destParsed.name + CONST.EXT.SCSS);
        const sassPath = Path.join(src, destParsed.dir, destParsed.name + CONST.EXT.SASS);
        const destFullPath = Path.join(dest, req.originalUrl)

        // Terminate if there is no matching source file.
        let srcFullPath = "";
        if (FS.existsSync(scssPath)) srcFullPath = scssPath;
        else if (FS.existsSync(sassPath)) srcFullPath = sassPath;
        else next();
        
        // Terminate if the dest file is newer than the source file.
        if (FS.existsSync(destFullPath)) {
            const srcStat = FS.statSync(srcFullPath);
            const destStat = FS.statSync(destFullPath);

            if (!args.flags['force-style'] && srcStat.mtime < destStat.mtime) {
                return next();
            }
        }

        compileSASS(srcFullPath, destFullPath);
        return next();        
    }
}

/**
 * Compile source .css to .scss with source map file.
 * @param {#} srcFullPath full path of .css source file
 * @param {*} destFullPath full path of .scss source file
 */
function compileSASS(srcFullPath, destFullPath) {
    console.log("HERE");
    const result = sass.compile(srcFullPath, CONST.SASS.OPTIONS);
    console.log(result);
    if (result) {
        mkdirif(destFullPath);
        FS.writeFileSync(destFullPath, result.css);
        FS.writeFileSync(destFullPath + CONST.EXT.MAP, JSON.stringify(result.sourceMap));
    }
}

export {style as default, compileSASS}