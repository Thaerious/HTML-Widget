import FS from "fs";
import Path from "path";
import Logger from "@thaerious/logger";
import CONST from "../constants.js";
import settings from "../settings.js";
import replaceInFile from "../replaceInFile.js";
import { Commands } from "../cli.js";
import { convert, mkdirif, fsjson, bfsObject as bfs } from "@thaerious/utility";
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
        case `server`:
            createServer(args);
            break;
        default:
            throw new Exception("missing command option {component, view, server}");
    }
}

function createView(name, args) {
    const record = instantiateRecord(name, CONST.TYPE.VIEW);
    const viewFullPath = mkdirif(record.dir.src, record.view);

    if (!FS.existsSync(viewFullPath)) {
        logger.channel(`verbose`).log(`  \\__ + ${viewFullPath}`);
        FS.copyFileSync(CONST.TEMPLATES.VIEW, viewFullPath);
        replaceInFile(viewFullPath, `\${style}`, Path.join(record.dir.sub, record.style.dest));
        replaceInFile(viewFullPath, `\${script}`, Path.join(record.dir.sub, record.es6));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${viewFullPath}`);
    }

    if (!FS.existsSync(Path.join(record.dir.src, record.es6))) {
        const path = mkdirif(record.dir.src, record.es6);
        logger.channel(`verbose`).log(`  \\__ + ${path}`);
        FS.writeFileSync(path, ``);
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${Path.join(record.dir.src, record.es6)}`);
    }

    if (!FS.existsSync(Path.join(record.dir.src, record.style.src))) {
        const path = mkdirif(record.dir.src, record.style.src);
        logger.channel(`verbose`).log(`  \\__ + ${path}`);
        FS.writeFileSync(path, ``);
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${Path.join(record.dir.src, record.style.src)}`);
    }

    if (!FS.existsSync(Path.join(record.dir.src, CONST.FILENAME.BODY_FILE))) {
        const path = mkdirif(record.dir.src, CONST.FILENAME.BODY_FILE);
        logger.channel(`verbose`).log(`  \\__ + ${path}`);
        FS.writeFileSync(path, ``);
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${Path.join(record.dir.src, CONST.FILENAME.BODY_FILE)}`);
    }
}

function createComponent(name, args) {
    logger.channel(`veryverbose`).log(`\\__ create widget`);

    if (convert.dash(name).split(`-`).length < 2) {
        logger.channel(`standard`).log(`error: name must consist of two or more dash-delimited words (${name})`);
        process.exit();
    }

    const record = instantiateRecord(name, CONST.TYPE.COMPONENT);

    const viewPath = mkdirif(record.dir.src, record.view);
    if (!FS.existsSync(viewPath)) {
        logger.channel(`verbose`).log(`  \\__ + ${viewPath}`);
        FS.copyFileSync(CONST.TEMPLATES.COMPONENT_EJS, viewPath);
        replaceInFile(viewPath, `\${name_dash}`, convert.dash(name));
        replaceInFile(viewPath, `\${name_underscore}`, convert.delimiter(name, `_`));
        replaceInFile(viewPath, `\${style_path}`, Path.join(record.dir.sub, record.style.dest));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${viewPath}`);
    }

    const scriptPath = Path.join(record.dir.src, record.es6);
    if (!FS.existsSync(scriptPath)) {
        logger.channel(`verbose`).log(`  \\__ + ${scriptPath}`);
        FS.copyFileSync(CONST.TEMPLATES.COMPONENT_MJS, scriptPath);
        replaceInFile(scriptPath, `\${name_dash}`, convert.dash(name));
        replaceInFile(scriptPath, `\${name_pascal}`, convert.pascal(name));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${scriptPath}`);
    }

    const stylePath = Path.join(record.dir.src, record.style.src);
    if (!FS.existsSync(stylePath)) {
        logger.channel(`verbose`).log(`  \\__ + ${stylePath}`);
        FS.copyFileSync(CONST.TEMPLATES.COMPONENT_SCSS, stylePath);
        replaceInFile(stylePath, `\${name_dash}`, convert.dash(name));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${stylePath}`);
    }
}

/**
 * Create a new record for component/view called 'name'.
 * @param {string} name 
 * @param {string} type {component, view}
 * @returns 
 */
function instantiateRecord(name, type) {
    let record = buildRecord({}, name, type);
    const infoPath = Path.join(record.dir.src, CONST.WIDGET_INFO_FILE);
    const widgetInfo = fsjson.loadIf(infoPath, { components: [] });
    
    record = buildRecord(record, name, type);

    const current = bfs.first(widgetInfo, `fullName`, record.fullName);
    if (current) return current;

    widgetInfo.components.push(record);
    fsjson.save(infoPath, widgetInfo);
    return record;
}

/**
 * Build a new empty record with the provided name,
 * @param source Will copy all fields from source.
 * @param name component / view name
 * @param type 'view' or 'component' see CONST.TYPE
 */
function buildRecord(source, name, type) {
    let root = ``;

    // Names with package prefixes. (ie package/name)
    if (name.indexOf(`/`) !== -1) {
        const parsed = Path.parse(name);
        name = parsed.name;
        root = parsed.dir;
    }

    // Path unique to this package, used for output subdirectories.
    const subDirectory = Path.join(
        settings.package,
        root, 
        convert.dash(name)
    );

    // Path to the source files
    const sourceDirectory = Path.join(
        settings['client-src'],
        subDirectory
    );

    const record = {
        ...{
            type: type,
            fullName: Path.join(root, convert.dash(name)),
            view: Path.join(name + `.ejs`),
            es6: Path.join(convert.pascal(name) + `.mjs`),
            style: {
                src: Path.join(name + `.scss`),
                dest: Path.join(name + `.css`)
            },
            dir: {
                sub: subDirectory,
                src: sourceDirectory,
            },
            package: settings.package
        },
        ...source
    };

    if (type === CONST.TYPE.COMPONENT) {
        record.tagName = convert.dash(name);
    }

    return record;
}

function loadInfoFile(path) {
    if (!FS.existsSync(path)){
        fsjson.merge(mkdirif(path), { components: [] });
    }
    return fsjson.load(mkdirif(path));
}

function createServer() {
    const destPath = mkdirif(CONST.LOCATIONS.SERVER, CONST.SERVER_DEST_FILE);
    const srcPath = Path.join(
        settings[`node-modules`],
        CONST.MODULE_NAME,
        CONST.SERVER_SRC_FILE
    );

    FS.copyFileSync(srcPath, destPath);
}

export default create;
