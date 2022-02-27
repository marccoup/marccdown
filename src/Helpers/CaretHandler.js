export default class CaretHandler {
    static placeCaret(element, offset = 0) {
        element.focus();

        const selection = window.getSelection()

        selection.setPosition(element, offset)
    }
}