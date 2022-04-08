import Path from "path";

const CONSTANTS = {
    NIDGET_PROPERTY_FILE: `.nidgetrc`,
    NIDGET_INFO_FILE: `nidget.info`,
    NODE_PACKAGE_FILE: `package.json`,
    NODE_MODULES_PATH: `node_modules`,
    MODULE_NAME: Path.join(`@nidget`, `core`),
    FILENAME: {
        TEMPLATES: "templates.ejs",
        LIB_FILE: `import_map.ejs`,
        BODY_FILE: `body.ejs`
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
    VIEW: Path.join(CONSTANTS.LOCATIONS.TEMPLATES, `view.template.ejs`)
}

export default CONSTANTS;
