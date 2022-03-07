import NidgetElement from "@nidget/core";

class CustomName extends NidgetElement {

    constructor() {
        super("custom-name-template");
    }
}

window.customElements.define('custom-name', CustomName);
export default CustomName;