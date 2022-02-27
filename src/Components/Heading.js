import Component from "./Component";

export default class Heading extends Component {
    static identityClass = 'marccdown_heading'
    static pattern = /^#{1,6} /m

    static h1ClassList = [];
    static h2ClassList = [];
    static h3ClassList = [];
    static h4ClassList = [];
    static h5ClassList = [];
    static h6ClassList = [];

    getLevel() {
        const matches = this.element.innerText.match(this.constructor.pattern);

        if (matches === null) {
            return 0; // Not a heading anymore
        }

        const hashes = matches[0].match(/#/gm)

        return hashes.length
    }

    shouldRevertToDefault() {
        return this.getLevel() === 0;
    }

    handle() {
        super.handle(); // Set to base state of component

        const level = this.getLevel();
        const classListProp = `h${level}ClassList`

        if (typeof this.constructor[classListProp] !== "undefined") {
            this.element.classList.add(...this.constructor[classListProp])
        }
    }
}
