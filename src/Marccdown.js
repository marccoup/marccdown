import Component from "./Components/Component";
import Paragraph from "./Components/Paragraph";
import Heading from "./Components/Heading";
import CaretHandler from "./Helpers/CaretHandler";
import UnorderedList from "./Components/UnorderedList";
import RepeatableComponent from "./Components/RepeatableComponent";

export default class Marccdown {
    /** @type HTMLElement */
    editor

    components = [
        Heading,
        UnorderedList
    ]

    defaultComponent = Paragraph

    constructor(editor, options = {}) {
        if (!(editor instanceof HTMLElement)) {
            throw new TypeError('element must be an instance of HTMLElement')
        }

        this.editor = editor

        this.parseOptions(options)

        this.editor.style.whiteSpace = 'pre-wrap'

        this.editor.addEventListener('keydown', (event) => this.onKeydown(event))
        this.editor.addEventListener('paste', (event) => this.onPaste(event))
        this.editor.addEventListener('input', () => this.onInput())
    }

    parseOptions(options) {
        for (const option in options) {
            switch (option) {
                case 'components':
                    if (typeof options[option] === "object") {
                        this.components = options[option]
                    }
                    break;
                case 'defaultComponent':
                    if (options[option] instanceof Component) {
                        this.defaultComponent = options[option]
                    }
            }
        }
    }

    init(defaultContent = '') {
        this.editor.contentEditable = 'true'
        this.editor.ariaMultiLine = 'true';

        this.parseContent(defaultContent)
    }

    parseContent(content) {
        if (content !== '') {
            content.split("\n").forEach(line => {
                let component = this.makeNewDefaultComponent(line)
                component = this.getComponent(component.element)
                component.handle()

                this.editor.appendChild(component.element)
            })
        }
    }

    getComponent(element) {
        let elementComponent;

        for (const component of this.components) {
            if (typeof component.isComponent === "undefined" || !component.isComponent) {
                // TODO: Handle this rather than fail silently
                continue
            }

            if (component.canElementBe(element)) {
                elementComponent = new component(element)
                break
            }
        }

        if (!(elementComponent instanceof Component)) {
            elementComponent = new this.defaultComponent(element)
        }

        if (elementComponent.shouldRevertToDefault()) {
            for (const child of element.children) {
                if (child.tagName.toLowerCase() !== 'br') {
                    child.remove()
                }
            }

            elementComponent = new this.defaultComponent(element)
        }

        return elementComponent;
    }

    makeNewDefaultComponent(content) {
        let element = document.createElement('div');

        if (content) {
            element.innerText = content
        } else {
            element.innerHTML = '<br>'
        }

        return new this.defaultComponent(element)
    }

    onInput() {
        const elements = this.editor.getElementsByTagName('div')

        if (elements.length < 1 && this.editor.innerText !== '') {
            let component = this.makeNewDefaultComponent(this.editor.innerText)

            this.editor.innerText = ''
            this.editor.appendChild(component.element)

            CaretHandler.placeCaret(component.element, component.element.innerText.length)
            component.handle()
        } else {
            const activeComponent = this.activeComponent()

            if (activeComponent === null) {
                for (const element of elements) {
                    this.getComponent(element).handle()
                }
            } else {
                activeComponent.handle();
            }
        }
    }

    activeComponent() {
        const focusNode = window.getSelection().focusNode;

        if (focusNode.isEqualNode(this.editor)) {
            return null
        }

        const elementToHandle = focusNode.parentElement.isEqualNode(this.editor)
            ? focusNode
            : focusNode.parentElement;

        if (elementToHandle instanceof HTMLElement) {
            return this.getComponent(elementToHandle)
        }

        return null
    }

    /**
     * @param {ClipboardEvent} event
     */
    onPaste(event) {
        event.preventDefault()
        event.stopPropagation()

        // TODO: Build pasting support
        alert('Pasting is not yet supported')
    }

    /**
     * @param {KeyboardEvent} event
     */
    onKeydown(event) {
        const component = this.activeComponent()

        switch (event.code) {
            case 'Enter':
                if (component instanceof RepeatableComponent) {
                    component.handleNewLine(this)

                    event.preventDefault()
                    event.stopImmediatePropagation()
                }
                break
        }

        if ((event.metaKey || event.ctrlKey) && event.code === 'KeyZ') {
            event.preventDefault()
            event.stopImmediatePropagation()

            // TODO: Build undo support
            alert('Undo/Redo is not yet supported')
        }
    }
}