import Path from "path";
import Logger from "@thaerious/logger";
import { Parser } from "acorn";
import { bfsAll } from "./bfsObject.js";
import FS, { lstatSync } from "fs";
import FSX from "fs-extra";
import Glob from "glob";
import CONSTANTS from "./constants.js";
import { convertToDash, convertDelimited } from "./names.js";
import renderSCSS from "./RenderSCSS.js";
import renderEJS from "./RenderEJS.js";
import renderJS from "./RenderJS.js";
import DependencyRecord from "./DependencyRecord.js";
import mkdirIf from "./mkdirIf.js";
import loadJSON from "./loadJSON.js";
import getFiles from "./getFiles.js";

const logger = Logger.getLogger();

/**
 * Creates lists of .js dependencies from nidget .ejs files.
 */
class NidgetPreprocessor {
    constructor() {
        this.resetRecords();
        this.input_paths = [];
        this.exclude_paths = [];
    }

    get package() {
        return this?.settings?.package;
    }

    applySettings(settings) {
        this.settings = { ...settings };
        if (settings.input){
            if (typeof settings.input === "string") this.addPath(settings.input);
            else for (const path of settings.input) this.addPath(path);
        }
        if (settings.exclude) for (const path of settings.exclude) this.addExclude(path);
        return this;
    }

    addPath(...filepaths) {
        Logger.getLogger().channel(`verbose`).log(`adding filepath ` + filepaths);
        this.input_paths = [...this.input_paths, ...filepaths];
        return this;
    }

    addExclude(...filepaths) {
        this.exclude_paths = [...this.exclude_paths, ...filepaths];
        return this;
    }

    /**
     * Recrusively retrieve matching files from the include directories
     * If a directory has a .nigetrc file then use the src and/or records from it.
     */
    getFiles(...extensions) {
        return getFiles(this.settings.input, {}, extensions); 
    }

    resetRecords() {
        this.nidgetRecords = {};
    }

    /**
     * Search node_modules for nidget libraries.
     * Using the package-dir field in nidget.json
     * copy any files found there to the output/lib_name
     * directory.
     *
     * Creates an import_map.ejs file that contains a mapping from
     * the package name to the location of module field in the
     * package.json file.
     */
    loadLibs(sourcePath = CONSTANTS.NODE_MODULES_PATH) {
        // clear inpmort map if looking at the root (node_modules) directory
        if (sourcePath === CONSTANTS.NODE_MODULES_PATH) {
            this.importMap = {
                imports: {},
            };
        }

        if (FS.existsSync(Path.join(sourcePath, CONSTANTS.NIDGET_PROPERTY_FILE))) {
            this.processPackage(sourcePath);
        }
        else if (FS.existsSync(Path.join(sourcePath, CONSTANTS.NODE_PACKAGE_FILE))) {
            /* do not recurse */
        }
        else {
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

                this.loadLibs(fullpath);
            }
        }

        const importFilePath = Path.join(Path.join(this.settings[`output-dir`]), CONSTANTS.LIB_FILE);
        mkdirIf(importFilePath);
        FS.writeFileSync(importFilePath, JSON.stringify(this.importMap, null, 2));
    }

    processPackage(packagePath){
        const nidgetJSON = loadJSON(packagePath, CONSTANTS.NIDGET_PROPERTY_FILE);
        const packageJSON = loadJSON(packagePath, CONSTANTS.NODE_PACKAGE_FILE);       

        const from = Path.join(packagePath, nidgetJSON['package-dir']);
        const to = Path.join(this.settings['output-dir'], packageJSON.name, nidgetJSON['package-dir']);

        FSX.copy(from, to);

        const importPath = "/" + Path.join(packageJSON.name, packageJSON.module ?? packageJSON.main);
        this.importMap.imports[packageJSON.name] = importPath;
    }

    discover() {
        Logger.getLogger().channel(`verbose`).log(`#discover`);

        const files = this.getFiles(
            CONSTANTS.EXTENSIONS.SCRIPT_SOURCE,
            CONSTANTS.EXTENSIONS.STYLE_SOURCE,
            CONSTANTS.EXTENSIONS.VIEW_SOURCE
        );

        try {
            for (const entry of files[CONSTANTS.EXTENSIONS.SCRIPT_SOURCE]) {
                Logger.getLogger().channel(`debug`).log(entry.full);
                const isNidget = this.isNidgetScript(entry.full);

                if (isNidget) this.addNidget(entry.full);
                else this.addES6Include(entry.full);
            }
        } catch (err) {
            logger.channel("standard").log(`*** JS Parsing Error:`);
            logger.channel("standard").log(`\t${err.message}`);
        }

        for (const entry of files[CONSTANTS.EXTENSIONS.VIEW_SOURCE]) {
            Logger.getLogger().channel(`debug`).log(entry.full);
            if (this.hasRecord(entry.full)) {
                this.getRecord(entry.full).view = entry.full;
                if (this.getRecord(entry.full).type === `include`) {
                    this.getRecord(entry.full).type = `view`;
                }
            } else {
                this.addView(entry.full);
            }
        }

        for (const entry of files[CONSTANTS.EXTENSIONS.STYLE_SOURCE]) {
            Logger.getLogger().channel(`debug`).log(entry.full);
            if (!this.hasRecord(entry.full)) this.addStyle(entry.full);
            else this.getRecord(entry.full).style = entry.full;
        }

        for (const name in this.nidgetRecords) {
            const record = this.nidgetRecords[name];
            if (record.package === this.settings.package) {
                record.seekEJSDependencies(this);
            }
        }

        return this;
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
            if (nidget.type == "view" || nidget.type == "nidget"){
                array.push(nidget);
            }
        }
        return array;
    }

    addStyle(filepath) {
        const name = convertToDash(Path.parse(filepath).name);
        if (!this.nidgetRecords[name]) {
            this.nidgetRecords[name] = new DependencyRecord(name, this.settings.package);
            this.nidgetRecords[name].type = `include`;
            this.nidgetRecords[name].style = filepath;
        }
        return this.nidgetRecords[name];
    }

    addES6Include(filepath) {
        const name = convertToDash(Path.parse(filepath).name);
        if (!this.nidgetRecords[name]) {
            this.nidgetRecords[name] = new DependencyRecord(name, this.settings.package);
            this.nidgetRecords[name].type = `include`;
            this.nidgetRecords[name].es6 = filepath;
        }
        return this.nidgetRecords[name];
    }

    addView(filepath) {
        const name = convertToDash(Path.parse(filepath).name);
        if (!this.nidgetRecords[name]) {
            this.nidgetRecords[name] = new DependencyRecord(name, this.settings.package);
            this.nidgetRecords[name].type = `view`;
            this.nidgetRecords[name].view = filepath;
        }
        return this.nidgetRecords[name];
    }

    addNidget(filepath) {
        const name = this.validateNidgetName(Path.parse(filepath).name);
        if (!this.nidgetRecords[name]) this.nidgetRecords[name] = new DependencyRecord(name, this.settings.package);
        this.nidgetRecords[name].es6 = filepath;
        this.nidgetRecords[name].type = `nidget`;
        return this.nidgetRecords[name];
    }

    /**
     * Ensure that the nidget name is in the correct format.
     * The correct format consists of two or more dash (-) separated words.
     * Converts camelcase names to dash delimited names.
     * Converts underscore delimited to dash delimited.
     * @param nidgetName
     */
    validateNidgetName(nidgetName) {
        const ctdNidgetName = convertToDash(nidgetName);
        if (ctdNidgetName.indexOf(`-`) === -1) {
            throw new Error(`Invalid nidget name: ` + nidgetName);
        }
        return ctdNidgetName;
    }

    isNidgetScript(filepath) {
        const code = FS.readFileSync(filepath);
        let ast = null;

        try {
            ast = Parser.parse(code, { ecmaVersion: `latest`, sourceType: `module` });
        } catch (err) {
            throw new Error(`${err.message} in ${filepath}`);
        }

        ast = bfsAll(ast, `type`, `ClassDeclaration`);
        const name = convertToDash(filepath);

        for (const node of ast) {
            const className = node.id.name;
            if (node?.superClass?.name) {
                const superName = node.superClass.name;
                if (name !== convertToDash(className)) continue;
                if (superName === "NidgetElement") return true; // allows for discover to be called without lib
                if (this.getRecord(superName)?.type === `nidget`) return true;
            }
        }

        logger.channel("debug").log(`is nidget script: ${filepath} false`);
        return false;
    }

    async babelify(destination = CONSTANTS.NIDGET_PACKAGE_DIR) {
        const { default: babel } = await import(`@babel/core`);

        logger.channel("very-verbose").log("  \\_ babelify");
        if (!FS.existsSync(destination)) FS.mkdirSync(destination, { recursive: true });

        for (const record of this.records) {
            if (!record.es6) continue;
            if (record.package !== this.settings.package) continue;

            logger.channel("very-verbose").log(`    \\_ ${record.es6}`);

            if (!FS.existsSync(record.es6)) {
                logger.channel(`standard`).log(`es6 file not found: ${record.es6}`);
                logger.channel(`very-verbose`).log(record.toString());
                continue;
            }

            const result = babel.transformFileSync(record.es6, {});
            if (result) {
                const path = Path.join(CONSTANTS.NIDGET_PACKAGE_DIR, record.name + ".js");
                FS.writeFileSync(path, result.code);
                record.script = path;
                logger.channel("very-verbose").log(`    \\_ ${path}`);
            }
        }

        return this;
    }

    sass() {
        logger.channel(`verbose`).log(`  \\_ sass`);

        for (const record of this.records) {
            if (record.package !== this.package) continue;
            try {
                if (record.style && (record.type === `view` || record.type === `nidget`)) {
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

    async browserify() {
        logger.channel(`verbose`).log(`# browserify`);

        for (const record of this.records) {
            try {
                if (record.type === `view` && record.script) {
                    try {
                        const outputPath = Path.join(this.settings[`output-dir`], Path.parse(record.script).name + `.js`);
                        await renderJS(record, outputPath, this.settings.package);
                    } catch (error) {
                        logger.channel("standard").log(error.toString());
                        logger.channel("standard").log(error.code);
                        logger.channel("standard").log(record.script);
                        process.exit();
                    }
                }
            } catch (err) {
                logger.channel("standard").log(`Error in #renderAllRecords`);
                logger.channel("standard").log(err);
            }
        }
        return this;
    }

    writePackageFile() {
        let nidgetJSON = {};

        if (FS.existsSync(CONSTANTS.NIDGET_PROPERTY_FILE)) {
            nidgetJSON = JSON.parse(FS.readFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, "utf-8"));
        }

        nidgetJSON.records = {};

        for (const record of this.records) {
            if (record.package !== this.settings.package) continue;
            if (record.type === "include") continue;
            nidgetJSON.records[record.name] = record;
        }

        FS.writeFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, JSON.stringify(nidgetJSON, null, 2));

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

            if (rec.type === "nidget" || rec.type === "view") {
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
