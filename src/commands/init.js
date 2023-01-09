import FS from "fs";
import Path from "path";
import CONST from "../const.js";
import { fsjson, mkdirif } from "@thaerious/utility"
import Logger from "@thaerious/logger";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
const logger = Logger.getLogger();

/**
 * Examine source directories for components and views.
 * @param {Object} records a dictionary of name -> record
 * @param {Command} commands a Command object (see cli.js)
 * @param {ParseArgs} args a parseargs object (see @thaerious/parseargs)
 */
function init(records, commands, args) {
    args = args || new ParseArgs().loadOptions(parseArgsOptions).run();
    
    buildDirStructure();
    createAppJS();
    modifyPackageJSON();
}

function buildDirStructure() {
    for (const path in CONST.DIR) {
        mkdirif(CONST.DIR[path]);
    }
}

function createAppJS() {
    const from = Path.join(CONST.NODE.MODULES_PATH, CONST.APP.MODULE_NAME, CONST.TEMPLATE.APP);
    const to = Path.join(CONST.DIR.SERVER, "app.js");
    FS.copyFileSync(from, to);
}

function modifyPackageJSON() {
    const pkj = fsjson.load(CONST.NODE.PACKAGE_JSON);
    pkj.type = pkj.type ?? "module";
    pkj.scripts.server = pkj.scripts.server ?? "node server-src/app.js";
    fsjson.save(CONST.NODE.PACKAGE_JSON, pkj);
}

export { init as default };
