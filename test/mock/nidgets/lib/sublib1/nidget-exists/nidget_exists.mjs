import NidgetElement from "@nidget/core";

class NidgetExists extends NidgetElement {

    constructor() {
        super("nidget-exists-template");
    }
}

window.customElements.define('nidget-exists', NidgetExists);
export default NidgetExists;