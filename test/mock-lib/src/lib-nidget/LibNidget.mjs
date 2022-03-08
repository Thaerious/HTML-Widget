import NidgetElement from "@nidget/core";

class LibNidget extends NidgetElement {

    constructor() {
        super("lib-nidget-template");
    }
}

window.customElements.define('lib-nidget', LibNidget);
export default LibNidget;