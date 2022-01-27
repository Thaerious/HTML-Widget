import NidgetElement from "@nidget/core";

class ${name_pascal} extends NidgetElement {

    constructor() {
        super("${name_dash}-template");
    }
}

window.customElements.define('${name_dash}', ${name_pascal});
export default ${name_pascal};