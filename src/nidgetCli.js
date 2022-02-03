#!/usr/bin/env node

import ParseArgs from "@thaerious/parseargs";
import FS, { lstatSync } from "fs";
import CONSTANTS from "./constants.js";
import Logger from "@thaerious/logger";
import Path from "path";
import { convertToDash, convertToPascal, convertDelimited } from "./names.js";
import extractSettings from "./extractSettings.js";
import Lib from "./lib.js";
// import Watcher from "./Watcher.js"

const parseArgsOptions = {
    flags: [
        {
            long: `verbose`,
            short: `v`,
            type: `boolean`,
        },
        {
            long: `name`,
            short: `n`,
            type: `string`,
        },
    ],
};

const logger = Logger.getLogger();
logger.channel(`standard`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`very-verbose`).enabled = false;
logger.channel(`debug`).enabled = false;

// logger.channel(`very-verbose`).prefix = (f, l, o)=>`${f} ${l} `;

const args = new ParseArgs().loadOptions(parseArgsOptions).run();
if (args.count(`silent`) > 0) logger.channel(`standard`).enabled = false;
if (args.count(`verbose`) >= 1) logger.channel(`verbose`).enabled = true;
if (args.count(`verbose`) >= 2) logger.channel(`very-verbose`).enabled = true;
if (args.count(`verbose`) >= 3) logger.channel(`debug`).enabled = true;

(async () => {
    if (args.args.length <= 2) help();

    for (const arg of args.args) {
        logger.channel(`very-verbose`).log(`arg: ${arg}`);
        switch (arg.toLowerCase()) {
            case "settings":
                console.log(extractSettings());
                break;
            case "init":
                init();
                break;
            case "create":
                if (!args.flags["name"]) {
                    logger.channel(`standard`).log(`missing -n, --name parameter`);
                } else {
                    create(args.flags["name"]);
                }
                break;
            case "view":
                if (!args.flags["name"]) {
                    logger.channel(`standard`).log(`missing -n, --name parameter`);
                } else {
                    view(args.flags["name"]);
                }
                break;
            case "scss":
            case "css":    
            case "sass":
                await sass();
                break;
            case "babel":
                await babel();
                break;
            case "records":
                await printRecords();
                break;
            case "readme":
                readme();
                break;
            case "pack":
                await pack();
                break;
            case "ejs":
                await ejs();
                break;
            case "es6":
            case "mjs":
                await es6();
                break;
            case "lib":
                new Lib().go();
                break;
            case "deploy":
                await deploy();
                break;
            case "dist":
                await dist();
                break;
            case "clean":
                clean();
                break;
            case "help":
                help();
                break;
        }
    }

    logger.channel("very-verbose").log(`uptime ${process.uptime()} s`);
})();

async function dist(){
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    const npp = new NidgetPreprocessor();
    const settings = extractSettings();
    settings['output-dir'] = settings['package-dir'];
    npp.applySettings(settings);
    npp.addModules();
    npp.buildRecords();
    npp.copyMJS(args.flags["link"]);
    npp.sass();
    npp.writePackageFile();
}

async function deploy(){
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    new Lib().go();
    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.addModules();
    npp.buildRecords();
    npp.ejs();
    npp.sass();
    npp.copyMJS(args.flags["link"]);
}

async function ejs() {
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.addModules();
    npp.buildRecords();
    npp.ejs();
}

async function es6() {
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.buildRecords();
    npp.copyMJS(args.flags["link"]);
}

async function sass() {
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.addModules();
    npp.buildRecords();
    npp.sass();
}

async function babel() {
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.addModules();
    npp.buildRecords();
    await npp.babelify();
    npp.writePackageFile();
}

async function pack() {
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.addModules();
    npp.buildRecords();
    await npp.browserify();
}

function clean() {
    const settings = extractSettings();

    if (FS.existsSync(settings["package-dir"])){
        logger.channel(`verbose`).log(`clean ${settings["package-dir"]}`);
        FS.rmSync(settings["package-dir"], { recursive: true });
    }
    if (FS.existsSync(settings["output-dir"])){
        logger.channel(`verbose`).log(`clean ${settings["output-dir"]}`);
        FS.rmSync(settings["output-dir"], { recursive: true });
    }

    if (!FS.existsSync(CONSTANTS.NIDGET_PROPERTY_FILE)) return;
    const nidgetJSON = JSON.parse(FS.readFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, "utf-8"));
    nidgetJSON.records = {};
    FS.writeFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, JSON.stringify(nidgetJSON, null, 2));
}

async function printRecords() {
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.addModules();
    npp.addRecordsFromFile(CONSTANTS.NIDGET_PROPERTY_FILE);
    npp.buildRecords();

    for (const record of npp.records) {
        logger.channel(`standard`).log(record.toString());
    }
}

function init() {
    if (!FS.existsSync("nidgets.json")) {
        logger.channel(`verbose`).log("create nidget.json file");
        FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/nidgets.json"), "nidgets.json");
    }

    if (!FS.existsSync(".babelrc")) {
        logger.channel(`verbose`).log("create .babelrc file");
        FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/.babelrc"), ".babelrc");
    }

    if (!FS.existsSync("output")) FS.mkdirSync("output");
    if (!FS.existsSync("src")) FS.mkdirSync("src");
    if (!FS.existsSync("src/nidgets")) FS.mkdirSync("src/nidgets");
    if (!FS.existsSync("src/view")) FS.mkdirSync("src/view");
}

function view(name) {
    const settings = extractSettings();
    const viewPath = Path.join(settings["view-src"], name); // src/nidget-name
    const templateName = Path.join(viewPath, convertDelimited(name, "_"));

    if (!FS.existsSync(viewPath)) FS.mkdirSync(viewPath, {recursive : true});

    FS.copyFileSync(CONSTANTS.VIEW_TEMPLATE_PATH, templateName + ".ejs");

    const relativePath = Path.relative(viewPath, CONSTANTS.PARTIALS_DIR);

    const importMapPath = 
        Path.relative(
            viewPath,
            Path.join(settings[`output-dir`], CONSTANTS.IMPORT_MAP_FILE_PATH, Path.parse(CONSTANTS.LIB_FILE).name)
        );

    replaceInFile(viewPath + `/${name}.ejs`, "${import_map}", importMapPath);
    replaceInFile(viewPath + `/${name}.ejs`, "${modules}", relativePath + "/modules");
    replaceInFile(viewPath + `/${name}.ejs`, "${templates}", relativePath + "/nidget-templates");

    if (!FS.existsSync(templateName + ".mjs")) {
        FS.writeFileSync(templateName + ".mjs", "");
    }

    if (!FS.existsSync(templateName + ".scss")) {
        FS.writeFileSync(templateName + ".scss", "");
    }
}

function create(name) {
    if (convertToDash(name).split("-").length < 2) {
        logger.channel(`standard`).log(`error: name must consist of two or more words`);
        process.exit();
    }

    const settings = extractSettings();
    const path = Path.join(settings["nidget-src"], name);
    if (!FS.existsSync(path)) FS.mkdirSync(path, {recursive: true});

    const templateName = Path.join(path, convertDelimited(name, "_"));

    FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.ejs"), templateName + ".ejs");
    FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.mjs"), templateName + ".mjs");
    FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.scss"), templateName + ".scss");
    replaceInFile(templateName + ".ejs", "${name_dash}", convertToDash(name));
    replaceInFile(templateName + ".ejs", "${name_underscore}", convertDelimited(name, "_"));
    replaceInFile(templateName + ".mjs", "${name_dash}", convertToDash(name));
    replaceInFile(templateName + ".mjs", "${name_pascal}", convertToPascal(name));
    replaceInFile(templateName + ".scss", "${name_dash}", convertToDash(name));
}

function replaceInFile(filename, search, replace) {
    const text = FS.readFileSync(filename, "utf-8");
    const newText = text.replaceAll(search, replace);
    FS.writeFileSync(filename, newText);
}

function readme() {
    const path = Path.join("node_modules", CONSTANTS.MODULE_NAME, "readme.md");
    const text = FS.readFileSync(path, "utf-8");
    logger.channel("standard").log(text);
}

function help() {
    const path = Path.join("node_modules", CONSTANTS.MODULE_NAME, "help.txt");
    const text = FS.readFileSync(path, "utf-8");
    logger.channel("standard").log(text);
}
