import Component from "./Component";

export default class Paragraph extends Component {
    static identityClass = 'marccdown_paragraph'

    static canElementBe(element) {
        return true
    }
}
