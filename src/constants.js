import Path from "path";

const CONST = {
    WIDGET_PROPERTY_FILE: `.widgetrc`,
    WIDGET_INFO_FILE: `widget.info`,
    NODE_PACKAGE_FILE: `package.json`,
    NODE_MODULES_PATH: `node_modules`,
    SERVER_SRC_FILE: `src/server/Server.js`,
    SERVER_DEST_FILE: `Server.js`,
    MODULE_NAME: Path.join(`@html-widget`, `core`),
    FILENAME: {
        IMPORT_FILE: `import_map.ejs`,
        BODY_FILE: `body.ejs`,
        TEMPLATES: `templates.ejs`
    },
    TYPE: {
        COMPONENT: `component`,
        VIEW: `view`
    }
};

// .widgetrc fields
CONST.RC = {
    "PACKAGE": "package",
    "OUTPUT_DIR": 'output-dir',
    "LINK_DIR": 'link-dir',
    "CLIENT_SRC": 'client-src',
    "SERVER_DIR": 'server-dir',
    "NODE_MODULES": 'node-modules',
    "PCAKGE_JSON": 'package-json'
}

CONST.LOCATIONS = {
    ROUTES_DIR: Path.join('server-src', 'routes'),
    STATIC_DIR: Path.join(`www`, `static/`),
    LINK_DIR: Path.join(`www`, `linked/`),
    OUTPUT: Path.join(`www`, `compiled/`),
    CLIENT_SRC: `client-src/`,
    SERVER: `server-src/`,
    TEMPLATES: Path.join(CONST.NODE_MODULES_PATH, CONST.MODULE_NAME, `templates`)
};

CONST.TEMPLATES = {
    VIEW: Path.join(CONST.LOCATIONS.TEMPLATES, `view.template.ejs`),
    COMPONENT_EJS: Path.join(CONST.LOCATIONS.TEMPLATES, `template.ejs`),
    COMPONENT_MJS: Path.join(CONST.LOCATIONS.TEMPLATES, `template.mjs`),
    COMPONENT_SCSS: Path.join(CONST.LOCATIONS.TEMPLATES, `template.scss`)
};

export default CONST;
