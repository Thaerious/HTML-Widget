import Path from "path";
import Logger from "@thaerious/logger";
import { Parser } from "acorn";
import { bfsAll } from "./bfsObject.js";
import FS, { lstatSync } from "fs";
import Glob from "glob";
import CONSTANTS from "./constants.js";
import {convertToDash} from "./names.js";
import renderSCSS from "./RenderSCSS.js";
import renderEJS from "./RenderEJS.js";
import renderJS from "./RenderJS.js";
import DependencyRecord from "./DependencyRecord.js";

const logger = Logger.getLogger();

/**
 * Creates lists of .js dependencies from nidget .ejs files.
 */
class NidgetPreprocessor {
    constructor() {
        this.resetRecords();
        this.input_paths = [];
        this.exclude_paths = [];
        this._package = ``;
    }

    get package(){
        return this._package;
    }

    applySettings(settings){
        this.settings = {...settings};
        if (settings.input)   for (const path of settings.input) this.addPath(path);
        if (settings.exclude) for (const path of settings.exclude) this.addExclude(path);         
        return this;
    }

    addModules(){
        this.addRecordsFromFile(CONSTANTS.NIDGET_PROPERTY_FILE);
        this._addModules();
    }

    _addModules(path = CONSTANTS.NODE_MODULES_PATH){
        Logger.getLogger().channel(`very-verbose`).log(`\\_ addModules:${path}`);
        const contents = FS.readdirSync(path, { withFileTypes: true });

        for (let dirEntry of contents){
            let fullpath = Path.join(path, dirEntry.name);

            if (dirEntry.isSymbolicLink()){
                const realpath = FS.realpathSync(Path.join(path, dirEntry.name));
                const stat = lstatSync(realpath);
                if (!stat.isDirectory()) continue;
            } else {
                if (!dirEntry.isDirectory()) continue;
            }

            if (dirEntry.name.startsWith("@")){
                this._addModules(fullpath);
            }
            else {
                const nidgetPropPath = Path.join(fullpath, CONSTANTS.NIDGET_PROPERTY_FILE);
                if (FS.existsSync(nidgetPropPath)){
                    this.addRecordsFromFile(nidgetPropPath);
                }
            }
        }

        return this;
    }

    addRecordsFromFile(filepath){
        const text = FS.readFileSync(filepath, "utf-8");
        const obj = JSON.parse(text);

        if (!obj.records) return;

        Logger.getLogger().channel(`very-verbose`).log(`  \\_ ${filepath}`);

        for (const name in obj.records){            
            const record = obj.records[name];
            Logger.getLogger().channel(`very-verbose`).log(`    \\_ ${record.package}:${record.name}`);
            this.nidgetRecords[name] = new DependencyRecord(record.name, record.package);
            this.nidgetRecords[name].view = record.view;
            this.nidgetRecords[name].es6 = record.es6;
            this.nidgetRecords[name].script = record.script;
            this.nidgetRecords[name].style = record.style;
            this.nidgetRecords[name].type = record.type;
        }
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

    getFiles() {
        const es6Files = [];
        const ejsFiles = [];
        const scssFiles = [];
        let globFiles = [];

        for (const inputPath of this.input_paths) {
            logger.channel("debug").log(`Input Path: ${inputPath}`);
            const files = new Glob.sync(inputPath, { ignore: this.exclude_paths });
            globFiles = [...globFiles, ...files];
        }

        for (const filepath of globFiles) {
            logger.channel("debug").log(`Glob Path: ${filepath}`);
            if (filepath.endsWith(`.ejs`)) ejsFiles.push(filepath);
            if (filepath.endsWith(`.mjs`)) es6Files.push(filepath);
            if (filepath.endsWith(`.scss`)) scssFiles.push(filepath);
        }

        return { es6Files, ejsFiles, scssFiles };
    }

    resetRecords() {
        this.nidgetRecords = {};
    }

    buildRecords() {
        Logger.getLogger().channel(`verbose`).log(`# build records`);

        const {es6Files, ejsFiles, scssFiles } = this.getFiles();

        try {
            for (const filepath of es6Files) {
                Logger.getLogger().channel(`debug`).log(`  \\_ ${filepath}`);
                const isNidget = this.isNidgetScript(filepath);

                if (this.hasRecord(filepath)) {
                    this.getRecord(filepath).es6 = filepath;
                    if (isNidget) this.getRecord.type = `nidget`;
                }

                if (isNidget) this.addNidget(filepath);
                else this.addES6Include(filepath);
            }
        } catch (err) {
            logger.channel("standard").log(`*** JS Parsing Error:`);
            logger.channel("standard").log(`\t${err.message}`);
        }

        for (const filepath of ejsFiles) {
            if (this.hasRecord(filepath)) {
                this.getRecord(filepath).view = filepath;
                if (this.getRecord(filepath).type === `include`){
                    this.getRecord(filepath).type = `view`;
                }
            } else {
                this.addView(filepath);
            }
        }

        for (const filepath of scssFiles) {
            if (!this.hasRecord(filepath)) this.addStyle(filepath);
            else this.getRecord(filepath).style = filepath;
        }

        for (const name in this.nidgetRecords) {
            const record = this.nidgetRecords[name];
            if (record.package === this.settings.package){
                record.seekEJSDependencies(this);
                record.seekJSDependencies(this);
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
            array.push(this.nidgetRecords[name]);
        }
        return array;
    }

    /**
     * Retrieve a non-reflective set nidgets that depend on a nidget
     */
    reverseLookup(nidgetName) {
        if (!this.getRecord(nidgetName)) throw new Error(`Unknown Nidget: ${nidgetName}`);
        const returnSet = new Set();

        if (this.getRecord(nidgetName).type === `nidget`) {
            nidgetName = convertToDash(nidgetName);
        }

        returnSet.add(this.getRecord(nidgetName));

        for (const parentName in this.nidgetRecords) {
            const parent = this.nidgetRecords[parentName];
            for (const child of parent.includes) {
                if (child.name === nidgetName) returnSet.add(parent);
            }
        }

        return returnSet;
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
            if (className === `NidgetElement`){
                logger.channel("debug").log(`is nidget script: ${filepath} true`);
                return true;
            }
            if (node?.superClass?.name) {
                const superName = node.superClass.name;
                if (name !== convertToDash(className)) continue;
                if (this.getRecord(superName)?.type === `nidget`) return true;
            }
        }

        logger.channel("debug").log(`is nidget script: ${filepath} false`);
        return false;
    }   

    async babelify(destination = CONSTANTS.NODE_DIST_PATH){
        const { default: babel } = await import(`@babel/core`);

        logger.channel("very-verbose").log("  \\_ babelify");
        if (!FS.existsSync(destination)) FS.mkdirSync(destination, {recursive : true});

        for (const record of this.records){
            if (!record.es6) continue;
            if (record.package !== this.settings.package) continue;

            logger.channel("very-verbose").log(`    \\_ ${record.es6}`);
            
            if (!FS.existsSync(record.es6)){
                logger.channel(`standard`).log(`es6 file not found: ${record.es6}`);
                logger.channel(`very-verbose`).log(record.toString());
                continue;
            }
    
            const result = babel.transformFileSync(record.es6, {});
            if (result){
                const path = Path.join(CONSTANTS.NODE_DIST_PATH, record.name + ".js");
                FS.writeFileSync(path, result.code);
                record.script = path;
                logger.channel("very-verbose").log(`    \\_ ${path}`);
            }        
        }

        return this;
    }

    sass (destination = CONSTANTS.NODE_DIST_PATH) {
        if (!FS.existsSync(destination)) FS.mkdirSync(destination, {recursive : true});

        logger.channel(`verbose`).log(`  \\_ sass`);

        for (const record of this.records) {
            try {
                if (record.style && (record.type === `view` || record.type === `nidget`)) {
                    logger.channel(`very-verbose`).log(`    \\_ ${record.package}:${record.style}`);   
                    const outname = record.name + `.css`;
                    const outpath = Path.join(this.settings['package-dir'], outname);
                    renderSCSS(record, outpath, this.settings.package);
                    record.style = outpath;
                    logger.channel(`verbose`).log(`    \\_ ${outpath}`);
                }
            } catch (err) {
                logger.channel("standard").log(`Error in #sass`);
                logger.channel("standard").log(err);
            }
        }
        return this;
    }

    async ejs () {
        logger.channel(`verbose`).log(`# ejs`);

        for (const record of this.records) {
            try {
                if (record.style && (record.type === `view`)) {  
                    await renderEJS(record, this.settings['output'], this.settings.package);
                }
            } catch (err) {
                logger.channel("standard").log(`Error in #renderAllRecords`);
                logger.channel("standard").log(err);
            }
        }
        return this;
    }  
    
    async browserify () {
        logger.channel(`verbose`).log(`# browserify`);

        for (const record of this.records) {
            try {
                if (record.type === `view` && record.script) {
                    try {
                        const outputPath = Path.join(this.settings[`outputPath`], Path.parse(record.script).name + `.js`);            
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

    writePackageFile(){
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

    copyCSS(){
        logger.channel(`verbose`).log(`# copy`);

        if (!FS.existsSync(this.settings[`outputPath`])){
            FS.mkdirSync(this.settings[`outputPath`], {recursive : true});
        }

        for (const rec of this.records){
            if ((rec.type === "nidget" || rec.type === "view") && rec.style !== ``){
                if (rec.package === this.settings.package){
                    const from = Path.join(this.settings[`package-dir`], rec.name + ".css");
                    const to = Path.join(this.settings[`outputPath`], rec.name + ".css");
                    FS.copyFileSync(from, to);      
                    logger.channel(`very-verbose`).log(`  \\_ source ${rec.package}:${from}`);              
                    logger.channel(`very-verbose`).log(`  \\_ destination ${rec.package}:${to}`);              
                } else {
                    const from = Path.join(CONSTANTS.NODE_MODULES_PATH, rec.package, rec.style);
                    const to = Path.join(this.settings[`outputPath`], rec.name + ".css");
                    FS.copyFileSync(from, to);
                    logger.channel(`very-verbose`).log(`  \\_ source ${rec.package}:${from}`);              
                    logger.channel(`very-verbose`).log(`  \\_ destination ${rec.package}:${to}`);              
                }
            }
        }
    }

}

export default NidgetPreprocessor;
