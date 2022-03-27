import Path from "path";

const CONSTANTS =  {
    NIDGET_PROPERTY_FILE: `.nidgetrc`,
    NIDGET_INFO_FILE: `nidget.info`,
    NODE_PACKAGE_FILE: `package.json`,
    NODE_MODULES_PATH: `node_modules`,    
    MODULE_NAME: Path.join(`@nidget`, `core`),
    FILENAME : {
        TEMPLATES : 'templates.mjs',
        LIB_FILE: `import_map.ejs`,
    },
    TEMPLATES: {
        VIEW: `view.template.ejs`
    },
    TYPE: {
        COMPONENT: "component",
        VIEW: "view"
    },
    LOCATIONS : {
        LINK_DIR : Path.join("www", "linked"),
        OUTPUT: Path.join("www", "compiled"),
        DEFAULT_SRC: "client-src"
    }
};

export default CONSTANTS;
