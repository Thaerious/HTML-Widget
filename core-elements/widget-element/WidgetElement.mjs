"use strict";

/**
 * Calling methods on the widget will treat shadow contents as regular contents.
 */
class WidgetElement extends HTMLElement {
    constructor(templateId) {
        super();
        if (templateId) this.applyTemplate(templateId);
    }

    /**
     connectedCallback is invoked each time the custom element is appended into a document-connected element
     */
    async connectedCallback() {
        this.detectDOM();
        await this.ready();

        if (!this.classList.contains("hidden")) this.classList.add("visible");
    }

    /**
     * Move elements from the parent element into the template element.
     * @param {string} selector query selector for elements to move.
     * @param {string} innerTarget query selector for element to move outer targets into.
     * @returns {*} all elements moved
     */
    internalize(selector, innerTarget = this.shadowRoot) {
        const outerSelection = this.outerSelectorAll(selector);

        if (typeof innerTarget === "string"){
            innerTarget = this.querySelector(innerTarget);
        }

        for (let item of outerSelection) {
            item.detach();
            innerTarget.append(item);
        }

        return outerSelection;
    }

    detectDOM() {
        this.DOM = {};
        for (const element of this.querySelectorAll("[id]")) {
            this.DOM[toCamelCase(element.id)] = element;
        }
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
    async applyTemplate(templateId) {
        if (this.shadowRoot !== null) return;
        let template = document.getElementById(templateId);

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

        this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    }

    async ready() {}

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
        while (el && el !== document && el !== window){
            const found = el.closest(selector);
            if (found) return found;
            el = el.getRootNode().host;
        }
    }

    dispatchEvent(event_name, options = {}){
        options = {...{composed: true, bubbles: true}, options};
        if (typeof event_name === "string") super.dispatchEvent(new CustomEvent(event_name, options));
        else super.dispatchEvent(event_name);
    }
}

/**
 *
 * @param input
 * @returns {*}
 */
function toCamelCase(input) {
    const split = input.split("-");
    for (let i = 1; i < split.length; i++) {
        split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
    }
    return split.join("");
}

WidgetElement.DISABLED_ATTRIBUTE = "widget-disabled";
WidgetElement.HIDDEN_CLASS = "hidden";
WidgetElement.VISIBLE_CLASS = "visible";

if (!window.customElements.get("widget-element")) {
    window.customElements.define("widget-element", WidgetElement);
}

export default WidgetElement;
