"use strict";

import {NidgetElement} from "@thaerious/nidget-renderer";

class NotInDir extends NidgetElement {
    constructor(templateId = "player-container-template") {
        super(templateId);
        this.extraPlayersHidden = true;
    }
}

window.customElements.define('not-in-dir', NotInDir);
export default NotInDir;