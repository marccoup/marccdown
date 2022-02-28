import RepeatableComponent from "./RepeatableComponent";

export default class OrderedList extends RepeatableComponent {
    static identityClass = 'marccdown_olist_item'

    static pattern = /^([0-9]+). /m

    static defaultContent = '1. '

    index = 1

    constructor(element) {
        super(element);

        const match = this.element.innerText.match(this.constructor.pattern)

        if (match !== null) {
            this.index = parseInt(match[1])
        }
    }

    shouldStopRepeatingAtNewLine() {
        return this.element.innerText === this.getNewItemContent(this.index)
    }

    getNewItemContent(index) {
        return `${index}. `;
    }

    getNextItemContent() {
        const nextIndex = this.index + 1

        return this.getNewItemContent(nextIndex)
    }

    changeIndex(newIndex) {
        this.index = newIndex

        this.element.innerText = this.element.innerText.replace(this.constructor.pattern, this.getNewItemContent(this.index))
    }

    handle() {
        super.handle();

        if (!this.shouldRevertToDefault()) {
            let sibling = this.element.nextSibling
            let nextIndex = this.index + 1;

            while (sibling && this.constructor.canElementBe(sibling)) {
                let siblingComponent = new this.constructor(sibling)

                if (siblingComponent.index === nextIndex) {
                    break;
                }

                siblingComponent.changeIndex(nextIndex)

                sibling = sibling.nextSibling
                nextIndex++
            }
        }
    }
}
