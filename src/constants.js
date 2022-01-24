import Path from "path";

export default {
    NIDGET_PROPERTY_FILE: `nidgets.json`,
    NODE_PACKAGE_FILE: `package.json`,
    NODE_MODULES_PATH: `node_modules`,
    NODE_DIST_PATH: `dist`,
    DEFAULT_OUTPUT: `output`,
    RELOAD_WS_URL: `reload_url.ws`,
    RELOAD_SERVER_PORT: 41141,
    MODULE_NAME: Path.join(`@nidget`, `core`),
    TEMPLATES: {
        PATH: `templates`,
        JS: `template.js`,
        SCSS: `template.scss`,
        EJS: `template.ejs`
    }
};
