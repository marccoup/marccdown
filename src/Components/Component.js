export default class Component {
    static identityClass
    static isComponent = true
    static classList = []

    /** @type HTMLElement */
    element;

    constructor(element) {
        if (!(element instanceof HTMLElement)) {
            throw new TypeError('element must be an instance of HTMLElement')
        }

        if (new.target === Component) {
            throw new TypeError("Cannot construct Component instances directly");
        }

        this.element = element;
    }

    static pattern = null;

    static canElementBe(element) {
        if (element.classList.contains(this.identityClass)) {
            return true
        }

        if (this.pattern === null) {
            return false
        }

        return element.innerText.match(this.pattern) !== null
    }

    shouldRevertToDefault() {
        return false;
    }

    handle() {
        this.element.classList.remove(...this.element.classList.values())
        this.element.classList.add(...this.constructor.classList)

        if (typeof this.constructor.identityClass === "string") {
            this.element.classList.add(this.constructor.identityClass)
        }
    }
}