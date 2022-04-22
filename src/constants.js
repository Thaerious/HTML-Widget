import Path from "path";

const CONSTANTS = {
    WIDGET_PROPERTY_FILE: `.widgetrc`,
    WIDGET_INFO_FILE: `widget.info`,
    NODE_PACKAGE_FILE: `package.json`,
    NODE_MODULES_PATH: `node_modules`,
    MODULE_NAME: Path.join(`@html-widget`, `core`),
    FILENAME: {
        LIB_FILE: `import_map.ejs`,
        BODY_FILE: `body.ejs`,
        TEMPLATES: `templates.ejs`
    },
    TYPE: {
        COMPONENT: "component",
        VIEW: "view",
    },
};

CONSTANTS.LOCATIONS = {
    LINK_DIR: Path.join("www", "linked"),
    OUTPUT: Path.join("www", "compiled"),
    DEFAULT_SRC: "client-src",
    TEMPLATES: Path.join(CONSTANTS.NODE_MODULES_PATH, CONSTANTS.MODULE_NAME, "templates")
}

CONSTANTS.TEMPLATES = {    
    VIEW: Path.join(CONSTANTS.LOCATIONS.TEMPLATES, `view.template.ejs`),
    COMPONENT_EJS: Path.join(CONSTANTS.LOCATIONS.TEMPLATES, `template.ejs`),
    COMPONENT_MJS: Path.join(CONSTANTS.LOCATIONS.TEMPLATES, `template.mjs`),
    COMPONENT_SCSS: Path.join(CONSTANTS.LOCATIONS.TEMPLATES, `template.scss`)
}

export default CONSTANTS;
