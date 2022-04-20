import WidgetElement from "@html-widget/core";

class LibWidget extends WidgetElement {

    constructor() {
        super("lib-widget-template");
    }
}

window.customElements.define('lib-widget', LibWidget);
export default LibWidget;