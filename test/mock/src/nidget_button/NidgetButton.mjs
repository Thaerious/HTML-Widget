import NidgetElement from "@nidget/core";

class NidgetButton extends NidgetElement {

    constructor() {
        super("nidget-button-template");
    }
}

window.customElements.define('nidget-button', NidgetButton);
export default NidgetButton;