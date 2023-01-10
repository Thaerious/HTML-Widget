import FS from "fs";
import Path from "path";
import Logger from "@thaerious/logger";
import CONST from "../const.js";
import { Commands } from "../cli.js";
import { convert, mkdirif, fsjson, bfsObject as bfs, loadTemplate } from "@thaerious/utility";
const logger = Logger.getLogger();

function create(records, commands, args) {
    if (Array.isArray(commands)) commands = new Commands(commands);

    switch (commands.nextCommand()) {
        case `component`:
            createComponent(commands.nextCommand(), args);
            break;
        case `view`:
            createView(commands.nextCommand(), args);
            break;
        default:
            throw new Exception("missing command option {component, view, server}");
    }
}

function createView(name, args) {
    const names = {
        pascal: convert.pascal(name),
        camel: convert.camel(name)
    }

    const mjsDest = mkdirif(CONST.DIR.VIEWS, names.camel, names.pascal + ".mjs");
    if (args.flags.replace || !FS.existsSync(mjsDest)) {        
        const mjsTemplate = mkdirif(CONST.VAR.ROOT, CONST.TEMPLATE.VIEW_MJS);
        FS.writeFileSync(mjsDest, loadTemplate(mjsTemplate, names));
    }
    
    const scssDest = mkdirif(CONST.DIR.VIEWS, names.camel, names.camel + ".scss");
    if (args.flags.replace || !FS.existsSync(scssDest)) {
        const scssTemplate = mkdirif(CONST.VAR.ROOT, CONST.TEMPLATE.VIEW_SCSS);
        FS.writeFileSync(scssDest, loadTemplate(scssTemplate, names));
    }

    const ejsDest = mkdirif(CONST.DIR.VIEWS, names.camel, names.camel + ".ejs");   
    if (args.flags.replace || !FS.existsSync(ejsDest)) {
        const ejsTemplate = mkdirif(CONST.VAR.ROOT, CONST.TEMPLATE.VIEW_EJS);
        FS.writeFileSync(ejsDest, loadTemplate(ejsTemplate, names));
    }

    const routeDest = mkdirif(CONST.DIR.ROUTES, "300." + names.camel + ".js");   
    if (args.flags.replace || !FS.existsSync(routeDest)) {
        const routeTemplate = mkdirif(CONST.VAR.ROOT, CONST.TEMPLATE.VIEW_ROUTE);
        FS.writeFileSync(routeDest, loadTemplate(routeTemplate, names));
    }    
}

function createComponent(name, args) {
    const names = {
        pascal: convert.pascal(name),
        camel: convert.camel(name),
        dash: convert.dash(name)
    }

    if (names.dash.split(`-`).length < 2) {
        logger.channel(`standard`).log(`error: name must consist of two or more dash-delimited words (invalid: ${name})`);
        process.exit();
    }

    const mjsDest = mkdirif(CONST.DIR.COMPONENTS, names.camel, names.pascal + ".mjs");
    if (args.flags.replace || !FS.existsSync(mjsDest)) {        
        const mjsTemplate = mkdirif(CONST.VAR.ROOT, CONST.TEMPLATE.COMP_MJS);
        FS.writeFileSync(mjsDest, loadTemplate(mjsTemplate, names));
    }
    
    const scssDest = mkdirif(CONST.DIR.COMPONENTS, names.camel, names.camel + ".scss");
    if (args.flags.replace || !FS.existsSync(scssDest)) {
        const scssTemplate = mkdirif(CONST.VAR.ROOT, CONST.TEMPLATE.COMP_SCSS);
        FS.writeFileSync(scssDest, loadTemplate(scssTemplate, names));
    }

    const ejsDest = mkdirif(CONST.DIR.COMPONENTS, names.camel, names.camel + ".ejs");   
    if (args.flags.replace || !FS.existsSync(ejsDest)) {
        const ejsTemplate = mkdirif(CONST.VAR.ROOT, CONST.TEMPLATE.COMP_EJS);
        FS.writeFileSync(ejsDest, loadTemplate(ejsTemplate, names));
    }
}

export default create;
