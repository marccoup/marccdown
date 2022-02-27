import RepeatableComponent from "./RepeatableComponent";

export default class UnorderedList extends RepeatableComponent {
    static identityClass = 'marccdown_ulist_item'

    static pattern = /^- /m

    static defaultContent = '- '
}
