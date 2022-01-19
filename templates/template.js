import NidgetElement from "@thaerious/nidget/NidgetElement.js";

class name_pascalcase extends NidgetElement {

    constructor() {
        super("${name_dash}-template");
    }
}

window.customElements.define('${name_dash}', ${name_pascalcase});
export default name_pascalcase;