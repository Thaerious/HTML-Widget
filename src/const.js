import Path from "path";

const CONST = {
    NODE: {
        PACKAGE_JSON: `package.json`,
        MODULES_PATH: `node_modules`,
    },
    APP: {
        MODULE_NAME: Path.join(`@html-widget`, `core`),
    },
    DIR: {
        SERVER: "server-src/",
        ROUTES: Path.join(`server-src`, `routes/`),
        AVAIL_ROUTES: Path.join(`server-src`, `routes-available/`),
        COMPILED: Path.join(`www`, `compiled/`),
        VIEWS: Path.join(`www`, `views/`),
        COMPONENTS: Path.join(`www`, `components/`),
    },
    TEMPLATE: {
        APP: Path.join(`templates`, `app.js`),
        VIEW_EJS: Path.join(`templates`, `view.template.ejs`),
        VIEW_MJS: Path.join(`templates`, `view.template.mjs`),
        VIEW_SCSS: Path.join(`templates`, `view.template.scss`),
        VIEW_ROUTE: Path.join(`templates`, `view.route.js`),
        COMP_EJS: Path.join(`templates`, `component.template.ejs`),
        COMP_MJS: Path.join(`templates`, `component.template.mjs`),
        COMP_SCSS: Path.join(`templates`, `component.template.scss`),
    },
    DEFAULT: {
        ROUTES_SUBDIR: "routes"
    },
    REGEX: {
        CSS: "*.css"
    },
    EXT: {
        CSS: ".css",
        SCSS: ".scss",
        SASS: ".sass",
        MAP: ".map"
    },
    SASS: {
        OPTIONS: {
            loadPaths: [
                Path.resolve(Path.join(`www`, `views/`)),
                Path.resolve("node_modules/"),
            ],
            sourceMap: true
        }
    },
    VAR: {
        ROOT: ""
    }
}

export default CONST;