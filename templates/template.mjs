import WidgetElement from "@html-widget/core";

class ${name_pascal} extends WidgetElement {

    constructor() {
        super("${name_dash}-template");
    }
}

window.customElements.define('${name_dash}', ${name_pascal});
export default ${name_pascal};