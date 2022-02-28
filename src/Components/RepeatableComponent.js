import Component from "./Component";
import CaretHandler from "../Helpers/CaretHandler";

export default class RepeatableComponent extends Component {
    static defaultContent

    constructor(element) {
        if (new.target === RepeatableComponent) {
            throw new TypeError("Cannot construct RepeatableComponent instances directly")
        }

        super(element)
    }

    shouldRevertToDefault() {
        return this.element.innerText.match(this.constructor.pattern) === null
    }

    shouldStopRepeatingAtNewLine() {
        return this.element.innerText === this.constructor.defaultContent
    }

    getNextItemContent() {
        return this.constructor.defaultContent
    }

    /**
     * @param {Marccdown} editor
     */
    handleNewLine(editor) {
        if (this.shouldStopRepeatingAtNewLine()) {
            this.element.innerHTML = '<br>'
            const defaultComponent = new editor.defaultComponent(this.element)

            defaultComponent.handle()
            CaretHandler.placeCaret(this.element)
        } else {
            this.repeat()
        }
    }

    repeat() {
        const element = document.createElement('div')
        element.innerText = this.getNextItemContent()

        const component = new this.constructor(element)

        this.element.after(component.element)

        component.handle()

        CaretHandler.placeCaret(component.element, this.constructor.defaultContent.length)
    }
}
