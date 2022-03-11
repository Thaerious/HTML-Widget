import NidgetElement from "@nidget/core";

class NameView extends NidgetElement {

    constructor() {
        super("name-view-template");
    }
}

window.customElements.define('name-view', NameView);
export default NameView;