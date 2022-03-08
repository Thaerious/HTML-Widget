import NidgetElement from "@nidget/core";

class PlayerContainer extends NidgetElement {

    constructor() {
        super("player-container-template");
    }
}

window.customElements.define('player-container', PlayerContainer);
export default PlayerContainer;