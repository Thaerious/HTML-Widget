import Path from "path";
import Logger from "@thaerious/logger";
import FS from "fs";
import CONSTANTS from "./constants.js";
import { convertToDash } from "./names.js";
import renderSCSS from "./RenderSCSS.js";
import mkdirIf from "./mkdirIf.js";
import loadJSON from "./loadJSON.js";
import seekFiles from "./seekFiles.js";
import getPropertyFiles from "./getPropertyFiles.js";

const logger = Logger.getLogger();

/**
 * Creates lists of .js dependencies from nidget .ejs files.
 */
class NidgetPreprocessor {
    constructor() {
        this.nidgetRecords = {};
        this.importMap = {
            imports: [],
        };
    }

    get package() {
        return this?.settings?.package;
    }

    applySettings(settings) {
        this.settings = { ...this.settings, ...settings };
        return this;
    }

    discover(path = this.settings.input) {
        Logger.getLogger().channel(`verbose`).log(`#discover ${path}`);

        const files = seekFiles(path, file => file.base === CONSTANTS.NIDGET_INFO_FILE);

        for (const file of files) {
            const nidgetInfo = loadJSON(file.full);
            for (const component of nidgetInfo.components) {
                component.path = Path.relative(path, file.dir);
                this.nidgetRecords[component.tagName] = component;
            }
        }

        return this;
    }

    /**
     * Search node_modules for nidget libraries.
     */
    loadLibs(path = CONSTANTS.NODE_MODULES_PATH) {
        for (const propertyFile of getPropertyFiles()) {
            const properties = loadJSON(propertyFile.full);
            this.discover(Path.join(propertyFile.dir, properties.input));
        }
    }

    getRecord(name) {
        if (this.nidgetRecords[name]) return this.nidgetRecords[name];
        return this.nidgetRecords[convertToDash(name)];
    }

    hasRecord(name) {
        if (this.nidgetRecords[name]) return true;
        if (this.nidgetRecords[convertToDash(name)]) return true;
        return false;
    }

    get records() {
        const array = [];
        for (const name in this.nidgetRecords) {
            const nidget = this.nidgetRecords[name];
            if (nidget.type == CONSTANTS.TYPE.VIEW || nidget.type == CONSTANTS.TYPE.COMPONENT) {
                array.push(nidget);
            }
        }
        return array;
    }

    sass() {
        logger.channel(`verbose`).log(`  \\_ sass`);

        for (const record of this.records) {
            try {
                renderSCSS(record, this.settings);
            } catch (err) {
                logger.channel("standard").log(`Error in #sass`);
                logger.channel("standard").log(err);
                logger.channel("standard").log(JSON.stringify(record, null, 2));
            }
        }
        return this;
    }

    linkEJS() {
        for (const rec of this.records) {
            if (rec.type === CONSTANTS.TYPE.VIEW) this.linkFile(rec, "view");
        }
    }

    linkMJS() {
        for (const rec of this.records) {
            this.linkFile(rec, "es6");
        }
    }

    /**
     * Link the file under field for each record to the output directory.
     */
    linkFile(rec, field) {
        logger.channel(`verbose`).log(`# link .mjs`);

        if (!FS.existsSync(this.settings[`output-dir`])) {
            FS.mkdirSync(this.settings[`output-dir`], { recursive: true });
        }

        if (rec[field] === "") return;
        if (!rec.package || rec.package == this.package) this.linkLocalFile(rec, field);
        else this.linkModuleFile(rec, field);
    }

    linkModuleFile(rec, field) {
        const properties = loadJSON(CONSTANTS.NODE_MODULES_PATH, rec.package, CONSTANTS.NIDGET_PROPERTY_FILE);

        let from = Path.join(CONSTANTS.NODE_MODULES_PATH, rec.package, properties.input, rec.path, rec.es6);
        const to = Path.join(this.settings[`output-dir`], rec.package, rec.path, rec[field]);
        this.importMap.imports[rec.package] = Path.join(rec.package, rec.path, rec[field]);

        if (FS.existsSync(to)) FS.rmSync(to);
        mkdirIf(to);
        FS.linkSync(from, to);

        logger.channel(`very-verbose`).log(`  \\_ source ${rec.package}:${from}`);
        logger.channel(`very-verbose`).log(`  \\_ destination ${rec.package}:${to}`);
    }

    linkLocalFile(rec, field) {
        let from = Path.join(this.settings["input"], rec.path, rec[field]);
        const to = Path.join(this.settings[`output-dir`], rec.path, rec[field]);

        if (FS.existsSync(to)) FS.rmSync(to);
        mkdirIf(to);
        FS.linkSync(from, to);

        logger.channel(`very-verbose`).log(`  \\_ source ${rec.package}:${from}`);
        logger.channel(`very-verbose`).log(`  \\_ destination ${rec.package}:${to}`);

        return to;
    }
}

export default NidgetPreprocessor;
