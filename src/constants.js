import Path from "path";

const CONSTANTS =  {   
    NIDGET_PROPERTY_FILE: `.nidgetrc`,
    NIDGET_INFO_FILE: `nidget.info`,
    NODE_PACKAGE_FILE: `package.json`,
    NODE_MODULES_PATH: `node_modules`,
    LIB_FILE: `import_map.ejs`,
    NIDGET_PACKAGE_DIR: `dist`,
    RELOAD_WS_URL: `reload_url.ws`,
    RELOAD_SERVER_PORT: 41141,
    MODULE_NAME: Path.join(`@nidget`, `core`),
    FILENAME : {
        TEMPLATES : 'templates.mjs'
    },
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
    },
    TYPE: {
        COMPONENT: "component",
        VIEW: "view"
    },
    LOCATIONS : {
        LINK_DIR : Path.join("www", "linked"),
        OUTPUT: Path.join("www", "compiled")
    }
};

CONSTANTS.PARTIALS_DIR = Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates", "partials"),
CONSTANTS.VIEW_TEMPLATE_PATH = Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates", CONSTANTS.TEMPLATES.VIEW);

export default CONSTANTS;
