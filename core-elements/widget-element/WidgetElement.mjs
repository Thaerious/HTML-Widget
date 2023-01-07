"use strict";

/**
 * Calling methods on the widget will treat shadow contents as regular contents.
 */
class WidgetElement extends HTMLElement {

    /**
     * Use 'templateId' to populate this element.
     * Settings:
     *  - shadowroot (default true) : if true attach as a shadow element
     * @param {*} templateId 
     * @param {*} settings 
     * @returns 
     */
    constructor(templateId, settings) {
        super();
        if (!templateId) return;

        settings = settings || { shadowroot: true };
        if (settings.shadowroot) this.shadowTemplate(templateId);
        else this.copyTemplate(templateId);
    }

    /**
     connectedCallback is invoked each time the custom element is appended into a document-connected element
     */
    async connectedCallback() {
        this.detectDOM();
        if (typeof this.ready === "function") window.addEventListener("load", async () => await this.ready(), { once: true });
    }

    /**
     * Move elements from the parent element into the template element.
     * @param {string} selector query selector for elements to move.
     * @param {string} innerTarget query selector for element to move outer targets into.
     * @returns {*} all elements moved
     */
    internalize(selector, innerTarget = this.shadowRoot) {
        if (typeof innerTarget === "string") {
            innerTarget = this.querySelector(innerTarget);
        }

        if (!selector) {
            for (const node of this.childNodes) {
                this.removeChild(node);
                innerTarget.append(node);
            }
            return;
        }

        const outerSelection = this.outerSelectorAll(selector);

        for (let item of outerSelection) {
            item.detach();
            innerTarget.append(item);
        }

        return outerSelection;
    }

    detectDOM() {
        this.dom = {};
        for (const element of this.querySelectorAll("[id]")) {
            this.dom[convertToCamel(element.id)] = element;
        }
        return this.dom;
    }

    /**
     * Retrieve a map of all data attributes
     * @returns {Map<any, any>}
     */
    dataAttributes() {
        let map = new Map();
        for (let attr of this.attributes) {
            if (attr.name.startsWith("data-")) {
                let name = attr.name.substr(5);
                map[name] = attr.value;
            }
        }
        return map;
    }

    /**
     * Attach a shadow element with the contents of the template named (templateID).
     * @return {undefined}
     */
    async shadowTemplate(templateId) {
        if (this.shadowRoot !== null) return;
        let template = document.getElementById(templateId);
        this.checkTemplate(template);
        const content = template.content.cloneNode(true);
        this.attachShadow({ mode: "open" }).appendChild(content);
    }

    /**
     * Append the contents of the template named into the body of this element.
     */
    async copyTemplate(templateId) {
        let template = document.getElementById(templateId);
        this.checkTemplate(template);
        const content = template.content.cloneNode(true);
        const children = Array.from(content.childNodes);

        children.forEach(ele => {
            if (ele.tagName) {
                switch (ele.tagName.toLowerCase()) {
                    case "default-attributes":
                        this.copyAttributes(ele);
                        break;
                    default:
                        this.appendChild(ele);
                        break;
                }
            }
        });
    }

    copyAttributes(from) {
        for (const attr of from.attributes) {
            if (this.getAttribute(attr.nodeName)) continue;
            this.setAttribute(attr.nodeName, attr.nodeValue);
        }
    }

    checkTemplate(template) {
        if (!template) {
            throw new Error(
                "Template '" +
                templateId +
                "' not found\n" +
                "Has the .ejs directive been added to the source file?\n" +
                "<%- include('../partials/widget-templates'); %>"
            );
        }

        if (template.tagName.toUpperCase() !== "TEMPLATE") {
            throw new Error("Element with id '" + templateId + "' is not a template.");
        }
    }

    get visible() {
        const v = this.classList.contains(WidgetElement.VISIBLE_CLASS) === true;
        const h = this.classList.contains(WidgetElement.HIDDEN_CLASS) === true;

        if (v && !h) return true;
        if (h && !v) return false;
        return undefined;
    }

    set visible(value) {
        if (value) this.show();
        else this.hide();
    }

    /**
     * Remove 'hidden' class.
     */
    show() {
        this.classList.remove(WidgetElement.HIDDEN_CLASS);
        this.classList.add(WidgetElement.VISIBLE_CLASS);
    }

    /**
     * Add 'hidden' class.
     */
    hide() {
        this.classList.remove(WidgetElement.VISIBLE_CLASS);
        this.classList.add(WidgetElement.HIDDEN_CLASS);
    }

    /**
     * Set the disabled flag that is read by widget mouse functions.
     * @param value
     */
    set disabled(value) {
        this.setAttribute(WidgetElement.DISABLED_ATTRIBUTE, value);
    }

    /**
     * Get the disabled flag that is read by widget mouse functions.
     * @param value
     */
    get disabled() {
        if (!this.hasAttribute(WidgetElement.DISABLED_ATTRIBUTE)) return false;
        return this.getAttribute(WidgetElement.DISABLED_ATTRIBUTE);
    }

    /**
     * Return true if this element was under the mouse for the event.
     * @param {type} event
     * @param {type} element
     * @return {Boolean}
     */
    isUnderMouse(event) {
        let x = event.clientX;
        let y = event.clientY;
        let current = document.elementFromPoint(x, y);

        while (current) {
            if (current === this) return true;
            current = current.parentElement;
        }
        return false;
    }

    /**
     * Perform a query selection on the element, not the shadow root.
     */
    outerSelector(selectors) {
        return super.querySelector(selectors);
    }

    /**
     * Perform a query select all on the element, not the shadow root.
     */
    outerSelectorAll(selectors) {
        return super.querySelectorAll(selectors);
    }

    /**
     * Run the query selector on this element.
     * If this element has a shadow, run it on that instead.
     * @param selectors
     * @returns {HTMLElementTagNameMap[K]}
     */
    querySelector(selectors) {
        if (this.shadowRoot) {
            return this.shadowRoot.querySelector(selectors);
        } else {
            return super.querySelector(selectors);
        }
    }

    /**
     * Run the query selector on this element.
     * If this element has a shadow, run it on that instead.
     * @param selectors
     * @returns {HTMLElementTagNameMap[K]}
     */
    querySelectorAll(selectors) {
        if (this.shadowRoot) {
            return this.shadowRoot.querySelectorAll(selectors);
        } else {
            return super.querySelectorAll(selectors);
        }
    }

    /**
     * Remove this element from it's parent.
     */
    detach() {
        return this.parentNode.removeChild(this);
    }

    /**
     * Index within the parent element.
     */
    index() {
        return Array.from(this.parentElement.children).indexOf(this);
    }

    closestParent(selector) {
        let el = this;
        while (el && el !== document && el !== window) {
            const found = el.closest(selector);
            if (found) return found;
            el = el.getRootNode().host;
        }
    }

    dispatchEvent(event_name, options = {}) {
        options = { ...{ composed: true, bubbles: true }, options };
        if (typeof event_name === "string") super.dispatchEvent(new CustomEvent(event_name, options));
        else super.dispatchEvent(event_name);
    }
}

function convertDelimited(string, delimiter = `-`) {
    string = string.trim();
    string = string.charAt(0).toLocaleLowerCase() + string.substr(1); // leading lower case
    string = string.replace(/[_ -]+/g, delimiter); // replace common delimeters with declared delimiter

    const r1 = RegExp(`[${delimiter}]([A-Z]+)`, `g`);
    string = string.replace(r1, `$1`); // normalize delimiter-capital to capital
    string = string.replace(/([A-Z]+)/g, `${delimiter}$1`).toLowerCase(); // change all upper to lower-delimiter

    const r2 = RegExp(`^[${delimiter}]+`);
    string = string.replace(r2, ``); // remove leading delimiters

    return string;
}

function convertToCamel(string) {
    string = convertDelimited(string, `-`);
    string = string.replace(/(-[a-z])+/g, v => v.toUpperCase()); // replace dash with nothing, letter preceeding to uppercase
    string = string.replace(/-+/g, ``); // remove dashes
    string = string.charAt(0).toLowerCase() + string.substr(1);
    return string;
}

WidgetElement.DISABLED_ATTRIBUTE = "widget-disabled";
WidgetElement.HIDDEN_CLASS = "hidden";
WidgetElement.VISIBLE_CLASS = "visible";

if (!window.customElements.get("widget-element")) {
    window.customElements.define("widget-element", WidgetElement);
}

export default WidgetElement;
