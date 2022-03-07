import NidgetElement from "@nidget/core";

class NidgetNotExists extends NidgetElement {

    constructor() {
        super("nidget-not-exists-template");
    }
}

window.customElements.define('nidget-not-exists', NidgetNotExists);
export default NidgetNotExists;