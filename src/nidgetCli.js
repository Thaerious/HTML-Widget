#!/usr/bin/env node

import ParseArgs from "@thaerious/parseargs";
import FS, { lstatSync } from "fs";
import CONSTANTS from "./constants.js";
import Logger from "@thaerious/logger";
import Path from "path";
import { convertToDash, convertToPascal, convertDelimited } from "./names.js";
import extractSettings from "./extractSettings.js";
import loadJSON from "./loadJSON.js";
import getDependencies from "./getDependencies.js";

let npp = undefined;

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
    const rvalue = await nidgetCli(args.args);
    if (rvalue) printResult(rvalue);
})();

async function nidgetCli(commands) {
    let rvalue = null;

    function nextCommand() {
        if (commands.length === 0) {
            logger.channel(`standard`).log("command parse error");
            process.exit(1);
        }
        return commands.shift().toLowerCase();
    }

    function peekCommand() {
        return commands[0].toLowerCase();
    }

    const iterator = {
        index: 0,
        next: function () {},
    };

    while (commands.length > 0) {
        switch (nextCommand()) {
            case "settings":
                console.log(extractSettings());
                break;
            case "i":
            case "init":
                init();
                break;
            case "create":
                switch (peekCommand()) {
                    case "nidget":
                        nextCommand();
                        createNidget(nextCommand());
                        break;
                    case "view":
                        nextCommand();
                        createView(nextCommand());
                        break;
                    default:
                        createNidget(nextCommand());
                        break;
                }
            case "records":
                await printRecords();
                break;
            case "pack":
                await pack();
                break;
            case "disc":
            case "discover":
                rvalue = await discover();
                break;
            case "link":
                rvalue = await link();
                break;
            case "style":
            case "sass":
                await sass();
                break;
            case "readme":
                readme();
                break;
            case "view":
                await ejs();
                break;
            case "script":
                await es6();
                break;
            case "deploy":
                await deploy();
                break;
            case "clean":
                clean();
                break;
            case "help":
                help(commands);
                break;
            case "settings":
                settings();
                break;
            case "dependencies":
                rvalue = dependencies(nextCommand());
                break;
        }
    }

    logger.channel("very-verbose").log(`uptime ${process.uptime()} s`);
    return rvalue;
}

function printResult(records){
    for (const record of records){
        const padding = 10 - record.type.length;
        logger.channel(`standard`).log(`${record.type} ${"-".repeat(padding)} ${record.tagName}`);
    }
}

async function dependencies(recordName){
    await loadNPP();
    const record = npp.getRecord(recordName);
    const dependencies = getDependencies(record, npp);
    return dependencies;
}

async function pack() {
    const rvalue = [];

    await loadNPP();
    npp.discover();

    for (const record of npp.records) {
        if (record.type === "nidget") {
            rvalue[record.tagName] = record.toJSON();
        }
    }

    if (FS.existsSync(CONSTANTS.NIDGET_PROPERTY_FILE)) {
        const settings = loadJSON(CONSTANTS.NIDGET_PROPERTY_FILE);

        settings.records = rvalue;
        FS.writeFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, JSON.stringify(settings, null, 2), "utf-8");
    }
}

async function loadNPP() {
    if (!npp) {
        const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
        npp = new NidgetPreprocessor();
        npp.applySettings(extractSettings());
    }
}

function settings() {
    const settings = extractSettings();
    for (const key of Object.keys(settings)) {
        logger.channel("standard").log(`${key} : ${settings[key]}`);
    }
}

async function discover() {
    await loadNPP();
    npp.discover();

    const rvalue = [];
    for (const record of npp.records) rvalue.push(record);
    return rvalue;
}

async function link() {
    await loadNPP();
    npp.loadLibs();

    const rvalue = [];
    for (const record of npp.records) rvalue.push(record);
    return rvalue;
}

async function deploy() {
    await loadNPP();
    npp.discover();
    npp.loadLibs();
    npp.ejs();
    npp.sass();
    npp.copyMJS(args.flags["link"]);
}

async function ejs() {
    await loadNPP();
    npp.linkEJS();
}

async function es6() {
    await loadNPP();
    npp.linkMJS();
}

async function sass() {
    await loadNPP();
    npp.sass();
}

function clean() {
    const settings = extractSettings();

    if (FS.existsSync(settings["package-dir"])) {
        logger.channel(`verbose`).log(`clean ${settings["package-dir"]}`);
        FS.rmSync(settings["package-dir"], { recursive: true });
    }
    if (FS.existsSync(settings["output-dir"])) {
        logger.channel(`verbose`).log(`clean ${settings["output-dir"]}`);
        FS.rmSync(settings["output-dir"], { recursive: true });
    }

    if (!FS.existsSync(CONSTANTS.NIDGET_PROPERTY_FILE)) return;
    const nidgetJSON = JSON.parse(FS.readFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, "utf-8"));
    nidgetJSON.records = {};
    FS.writeFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, JSON.stringify(nidgetJSON, null, 2));
}

async function printRecords() {
    await loadNPP();
    for (const record of npp.records) {
        logger.channel(`standard`).log(JSON.stringify(record, null, 2));
    }
}

function init() {
    if (!FS.existsSync(CONSTANTS.NIDGET_PROPERTY_FILE)) {
        logger.channel(`verbose`).log("create nidget.json file");
        FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates", CONSTANTS.NIDGET_PROPERTY_FILE), CONSTANTS.NIDGET_PROPERTY_FILE);
    }

    if (!FS.existsSync(".babelrc")) {
        logger.channel(`verbose`).log("create .babelrc file");
        FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/.babelrc"), ".babelrc");
    }
}

function createView(name) {
    const settings = extractSettings();
    const viewPath = Path.join(settings["view-src"], name);

    if (!FS.existsSync(viewPath)) FS.mkdirSync(viewPath, { recursive: true });

    const relativePath = Path.relative(viewPath, CONSTANTS.PARTIALS_DIR);
    const importMapPath = Path.relative(viewPath, Path.join(settings[`output-dir`], Path.parse(CONSTANTS.LIB_FILE).name));
    const packageJSON = loadJSON(CONSTANTS.NODE_PACKAGE_FILE);

    const infoPath = Path.join(settings["view-src"], name, CONSTANTS.NIDGET_INFO_FILE);
    if (!FS.existsSync(infoPath)) {
        const nidgetInfo = {
            components: [
                {
                    type: CONSTANTS.TYPE.VIEW,
                    tagName: convertToDash(name),
                    view: name + ".ejs",
                    es6: name + ".mjs",
                    style: {
                        src : name + ".scss",
                        dest : name + ".css"
                    },
                    package: packageJSON.name
                },
            ],
        };
        FS.writeFileSync(infoPath, JSON.stringify(nidgetInfo, null, 4));
    }

    if (!FS.existsSync(Path.join(viewPath, name + ".ejs"))) {
        FS.copyFileSync(CONSTANTS.VIEW_TEMPLATE_PATH, Path.join(viewPath, name + ".ejs"));
        replaceInFile(viewPath + `/${name}.ejs`, "${import_map}", importMapPath);
        replaceInFile(viewPath + `/${name}.ejs`, "${modules}", relativePath + "/modules");
        replaceInFile(viewPath + `/${name}.ejs`, "${templates}", relativePath + "/nidget-templates");
    }

    if (!FS.existsSync(Path.join(viewPath, name + ".mjs"))) {
        FS.writeFileSync(Path.join(viewPath, name + ".mjs"), "");
    }

    if (!FS.existsSync(Path.join(viewPath, name + ".scss"))) {
        FS.writeFileSync(Path.join(viewPath, name + ".scss"), "");
    }
}

function createNidget(name) {
    if (convertToDash(name).split("-").length < 2) {
        logger.channel(`standard`).log(`error: name must consist of two or more words`);
        process.exit();
    }

    name = convertDelimited(name, "_");
    const settings = extractSettings();
    const path = Path.join(settings["nidget-src"], name);
    if (!FS.existsSync(path)) FS.mkdirSync(path, { recursive: true });

    const templateName = Path.join(path, convertDelimited(name, "_"));
    const moduleSourceName = Path.join(path, convertToPascal(name, "_") + ".mjs");
    const packageJSON = loadJSON(CONSTANTS.NODE_PACKAGE_FILE);

    const infoPath = Path.join(settings["nidget-src"], name, CONSTANTS.NIDGET_INFO_FILE);
    if (!FS.existsSync(infoPath)) {
        const nidgetInfo = {
            components: [
                {
                    type: CONSTANTS.TYPE.COMPONENT,
                    tagName: convertToDash(name),
                    view: name + ".ejs",
                    es6: convertToPascal(name) + ".mjs",
                    style: {
                        src : name + ".scss",
                        dest : name + ".css"
                    },
                    package: packageJSON.name,
                },
            ],
        };
        FS.writeFileSync(infoPath, JSON.stringify(nidgetInfo, null, 4));
    }

    if (!FS.existsSync(templateName + ".ejs")) {
        FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.ejs"), templateName + ".ejs");
        replaceInFile(templateName + ".ejs", "${name_dash}", convertToDash(name));
        replaceInFile(templateName + ".ejs", "${name_underscore}", convertDelimited(name, "_"));
    }

    if (!FS.existsSync(moduleSourceName)) {
        FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.mjs"), moduleSourceName);
        replaceInFile(moduleSourceName, "${name_dash}", convertToDash(name));
        replaceInFile(moduleSourceName, "${name_pascal}", convertToPascal(name));
    }

    if (!FS.existsSync(templateName + ".scss")) {
        FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.scss"), templateName + ".scss");
        replaceInFile(templateName + ".scss", "${name_dash}", convertToDash(name));
    }
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

function help(commands) {
    const helpContext = commands?.shift() || "index";
    const path = Path.join(CONSTANTS.NODE_MODULES_PATH, CONSTANTS.MODULE_NAME, `help/${helpContext}.txt`);
    console.log(path);
    if (!FS.existsSync(path)) {
        logger.channel("standard").log(`Help for command '${helpContext}' not found.`);
    } else {
        const text = FS.readFileSync(path, "utf-8");
        logger.channel("standard").log(text);
    }
}

export default nidgetCli;
