import Path from "path";

const CONSTANTS =  {
    NIDGET_PROPERTY_FILE: `.nidgetrc`,
    NODE_PACKAGE_FILE: `package.json`,
    NODE_MODULES_PATH: `node_modules`,
    LIB_FILE: `import_map.ejs`,
    NIDGET_PACKAGE_DIR: `dist`,
    DEFAULT_OUTPUT: `output`,
    RELOAD_WS_URL: `reload_url.ws`,
    RELOAD_SERVER_PORT: 41141,
    MODULE_NAME: Path.join(`@nidget`, `core`),
    TEMPLATES: {
        PATH: `templates`,
        JS: `template.js`,
        SCSS: `template.scss`,
        EJS: `template.ejs`,
        VIEW: `view.template.ejs`
    },
    EXTENSIONS: {
        SCRIPT_SOURCE: `.mjs`,
        STYLE_SOURCE: `.scss`,
        VIEW_SOURCE: `.ejs`,
    }
};

CONSTANTS.PARTIALS_DIR = Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates", "partials"),
CONSTANTS.VIEW_TEMPLATE_PATH = Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates", CONSTANTS.TEMPLATES.VIEW);

export default CONSTANTS;
