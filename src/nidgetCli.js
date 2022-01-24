#!/usr/bin/env node

import ParseArgs from "@thaerious/parseargs";
import FS from "fs";
import CONSTANTS from "./constants.js";
import Logger from "@thaerious/logger";
import Path from "path";
import { convertToDash, convertToPascal, convertDelimited } from "./names.js";
import extractSettings from "./extractSettings.js";
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
    for (const arg of args.args) {
        logger.channel(`very-verbose`).log(`arg: ${arg}`);
        switch (arg) {
            case "args":
                console.log(args);
                break;
            case "init":
                init();
                break;
            case "create":
                if (!args.flags["name"]){
                    logger.channel(`standard`).log(`missing -n, --name parameter`);
                } else {
                    create(args.flags["name"]);
                }
                break;
            case "view":
                if (!args.flags["name"]){
                    logger.channel(`standard`).log(`missing -n, --name parameter`);
                } else {
                    view(args.flags["name"]);
                }                
                break;
            case "render":
                await render();
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

async function render(){
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.addModules();
    npp.buildRecords();
    npp.babelify();
    npp.sass();
    npp.writePackageFile();
}

async function pack(){
    const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.addModules();
    npp.buildRecords();
    await npp.browserify();
    await npp.ejs();
    npp.copyCSS();
}

function clean() {
    const settings = extractSettings();

    if (FS.existsSync(settings["package-dir"])) FS.rmSync(settings["package-dir"], { recursive: true });
    if (FS.existsSync(settings["outputPath"])) FS.rmSync(settings["outputPath"], { recursive: true });

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
    if (!FS.existsSync("nidgets.json")){
        logger.channel(`verbose`).log("create nidget.json file");
        FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/nidgets.json"), "nidgets.json");
    }

    if (!FS.existsSync(".babelrc")){
        logger.channel(`verbose`).log("create .babelrc file");
        FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/.babelrc"), ".babelrc");
    }

    if (!FS.existsSync("output")) FS.mkdirSync("output");
    if (!FS.existsSync("src")) FS.mkdirSync("src");
    if (!FS.existsSync("src/nidgets")) FS.mkdirSync("src/nidgets");
    if (!FS.existsSync("src/view")) FS.mkdirSync("src/view");
}

function view(name) {
    const settings = loadSettings();
    const viewPath = Path.join(settings["view-src"], name);
    const templateName = Path.join(viewPath, convertDelimited(name, "_"));
    const templatePath = Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates", "view.template.ejs");
    const partialsPath = Path.join("node_modules", CONSTANTS.MODULE_NAME, "dist", "partials");

    if (!FS.existsSync(viewPath)) FS.mkdirSync(viewPath);

    FS.copyFileSync(templatePath, templateName + ".ejs");

    const relativePath = Path.relative(viewPath, partialsPath);

    replaceInFile(viewPath + `/${name}.ejs`, "${head}", relativePath + "/head");
    replaceInFile(viewPath + `/${name}.ejs`, "${templates}", relativePath + "/nidget-templates");

    if (!FS.existsSync(templateName + ".js")) {
        FS.writeFileSync(templateName + ".js", "");
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

    const settings = loadSettings();
    const path = Path.join(settings["nidget-src"], name);
    if (!FS.existsSync(path)) FS.mkdirSync(path);

    const templateName = Path.join(path, convertDelimited(name, "_"));

    FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.ejs"), templateName + ".ejs");
    FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.js"), templateName + ".js");
    FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.scss"), templateName + ".scss");
    replaceInFile(templateName + ".ejs", "${name_dash}", convertToDash(name));
    replaceInFile(templateName + ".ejs", "${name_underscore}", convertDelimited(name, "_"));
    replaceInFile(templateName + ".js", "${name_dash}", convertToDash(name));
    replaceInFile(templateName + ".js", "${name_pascal}", convertToPascal(name));
    replaceInFile(templateName + ".scss", "${name_dash}", convertToDash(name));
}

function loadSettings() {
    const text = FS.readFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, "utf-8");
    return JSON.parse(text);
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
