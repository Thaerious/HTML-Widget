import NidgetElement from "@nidget/core";

class AspectContainer extends NidgetElement {

    constructor() {
        super("aspect-container-template");
    }
}

window.customElements.define('aspect-container', AspectContainer);
export default AspectContainer;