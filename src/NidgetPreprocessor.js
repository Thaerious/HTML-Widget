import Path from "path";
import Logger from "@thaerious/logger";
import { Parser } from "acorn";
import { bfsAll } from "./bfsObject.js";
import FS, { lstatSync } from "fs";
import FSX from "fs-extra";
import CONSTANTS from "./constants.js";
import { convertToDash, convertDelimited } from "./names.js";
import renderSCSS from "./RenderSCSS.js";
import renderEJS from "./RenderEJS.js";
import renderJS from "./RenderJS.js";
import DependencyRecord from "./DependencyRecord.js";
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
                const record = new DependencyRecord();
                record.type = component.type;
                record.name = component.tagName;
                record.es6 = component.es6;
                record.style = component.style;
                record.package = component.package;
                this.nidgetRecords[record.name] = record;
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
            for (const input of properties.input) {
                this.discover(Path.join(propertyFile.dir, input));
            }
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
            if (record.package !== this.package) continue;
            try {
                if (record.style && (record.type === CONSTANTS.TYPE.VIEW || record.type === CONSTANTS.TYPE.COMPONENT)) {
                    renderSCSS(record, this.settings);
                }
            } catch (err) {
                logger.channel("standard").log(`Error in #sass`);
                logger.channel("standard").log(err);
            }
        }
        return this;
    }

    async ejs() {
        logger.channel(`verbose`).log(`# ejs`);

        for (const record of this.records) {
            try {
                if (record.style && record.type === `view`) {
                    await renderEJS(record, this.settings);
                }
            } catch (err) {
                logger.channel("standard").log(`Error in #ejs`);
                logger.channel("standard").log(err);
            }
        }
        return this;
    }

    /**
     * Copy or link all es6 files found in the input directories to the output
     * directories, keeping the directory structure.
     */
    copyMJS(link = false) {
        logger.channel(`verbose`).log(`# ${link ? "link" : "copy"} mjs`);

        if (!FS.existsSync(this.settings[`output-dir`])) {
            FS.mkdirSync(this.settings[`output-dir`], { recursive: true });
        }

        for (const rec of this.records) {
            if (rec.package !== this.package) continue;
            if (rec.es6 === "") continue;

            if (rec.type === CONSTANTS.TYPE.COMPONENT || rec.type === CONSTANTS.TYPE.VIEW) {
                let from = Path.join(this.settings["input"], rec.es6);
                const to = Path.join(this.settings[`output-dir`], this.package, rec.es6);
                mkdirIf(to);

                if (!link) FS.copyFileSync(from, to);
                else if (!FS.existsSync(to)) FS.linkSync(from, to);

                logger.channel(`very-verbose`).log(`  \\_ source ${rec.package}:${from}`);
                logger.channel(`very-verbose`).log(`  \\_ destination ${rec.package}:${to}`);
            }
        }
    }
}

export default NidgetPreprocessor;
