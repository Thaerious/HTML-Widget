import NidgetElement from "@nidget/core";

class SubPath extends NidgetElement {

    constructor() {
        super("sub-path-template");
    }
}

window.customElements.define('sub-path', SubPath);
export default SubPath;