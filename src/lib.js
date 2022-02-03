import CONSTANTS from "./constants.js";
import Logger from "@thaerious/logger";
import FS, { lstatSync } from "fs";
import Path from "path";
import extractSettings from "./extractSettings.js";

class Lib {
    constructor(){
        this.settings = extractSettings();

        this.importMap = {
            imports : {}
        };
    }

    go(sourcePath = CONSTANTS.NODE_MODULES_PATH) {
        Logger.getLogger().channel(`very-verbose`).log(`  \\_ lib:${sourcePath}`);
        const contents = FS.readdirSync(sourcePath, { withFileTypes: true });

        for (let dirEntry of contents) {
            let fullpath = Path.join(sourcePath, dirEntry.name);

            if (dirEntry.isSymbolicLink()) {
                const realpath = FS.realpathSync(Path.join(sourcePath, dirEntry.name));
                const stat = lstatSync(realpath);
                if (!stat.isDirectory()) continue;
            } else {
                if (!dirEntry.isDirectory()) continue;
            }

            if (dirEntry.name.startsWith("@")) {
                this.go(fullpath);
            } else {
                const nidgetPropPath = Path.join(fullpath, CONSTANTS.NIDGET_PROPERTY_FILE);
                if (FS.existsSync(nidgetPropPath)) {
                    this.copyLib(nidgetPropPath);
                }
            }
        }
        const importFileDir = Path.join(this.settings[`output-dir`], CONSTANTS.IMPORT_MAP_FILE_PATH);
        if (!FS.existsSync(importFileDir)) FS.mkdirSync(importFileDir, {recursive : true});
        const importFilePath = Path.join(importFileDir, CONSTANTS.LIB_FILE);
        FS.writeFileSync(importFilePath, JSON.stringify(this.importMap, null, 2));
    }

    copyLib(path) {
        const libProperties = JSON.parse(FS.readFileSync(path)); // nidget.json
        const packageJSONText = FS.readFileSync(Path.join(Path.parse(path).dir, CONSTANTS.NODE_PACKAGE_FILE));
        const packageJSON = JSON.parse(packageJSONText); // package.json
        const entryPoint = packageJSON.module ?? packageJSON.main;        
        if (!entryPoint) return;

        const packageSubDir = Path.parse(path).dir.substring(CONSTANTS.NODE_MODULES_PATH.length + 1);

        const pkgDir = libProperties[`package-dir`] ?? Path.join(CONSTANTS.NIDGET_PACKAGE_DIR);
        const from = Path.join(Path.parse(path).dir, pkgDir);
        const to = Path.join(this.settings[`output-dir`], CONSTANTS.IMPORT_MAP_FILE_PATH, packageSubDir, pkgDir);

        const mapPath = Path.join(CONSTANTS.IMPORT_MAP_FILE_PATH, packageSubDir, entryPoint);
        this.importMap.imports[packageJSON.name] = "/" + mapPath;

        this._copyLib(from, to);
    }

    _copyLib(from, to) {
        Logger.getLogger().channel(`very-verbose`).log(`    \\_ from:${from}`);
        Logger.getLogger().channel(`very-verbose`).log(`    \\_ to:${to}`);

        FS.mkdirSync(to, { recursive: true });
        const contents = FS.readdirSync(from, { withFileTypes: true });
        for (let dirEntry of contents) {
            if (dirEntry.isFile()) {
                Logger.getLogger().channel(`very-verbose`).log(`      \\_ file:${dirEntry.name}`);
                FS.copyFileSync(Path.join(from, dirEntry.name), Path.join(to, dirEntry.name));
            } else if (dirEntry.isDirectory()) {
                this._copyLib(Path.join(from, dirEntry.name), Path.join(to, dirEntry.name));
            }
        }
    }
}

export default Lib;
