# Marccdown

An inline-rendering vanilla JS markdown editor, without default styles

This package is still in active development, it's missing many features, 
lacks proper testing, and shouldn't be used in production environments that matter. 

## Quickstart
Install the package

```zsh
# Using Yarn
yarn add marccdown
# Using NPM
npm install marccdown
```

Usage
```js
import {Marccdown} from "marccdown"

const editor = new Marccdown(document.getElementById('myEditorId'))
editor.init()
```

## Features

- [x] Headings 1-6
- [x] Paragraphs
- [x] Unordered list items
- [x] Ordered list items
- [ ] Nested list items
- [ ] Links
- [ ] Tasks
- [ ] Quotes
- [ ] Code blocks
- [ ] Styling (bold, italic, strikethrough)
- [ ] Inline code
- [ ] Support pasting
- [ ] Support undo/redo
- [ ] Images

## Customising the Editor

You can add styles to editor components using the `Component.classList` system
```js
import {Marccdown, UnorderedList} from "marccdown"

UnorderedList.classList = ['text-sm']

const editor = new Marccdown(document.getElementById('myEditorId'))
editor.init()
```

Alternatively you can go the traditional route and add the styles in your css file, 
each component has a unique (to the component type) class applied to each instance of it in the editor.
```css
.marccdown_ulist_item {
    /* Tailwind */
    @apply text-sm;
    
    /* Normal */
    font-size: 0.875rem;
    line-height: 1.25rem;
}
``` 

### Component Reference

You can use the reference table below to see what classes are added to each component type, and other `classList` 
properties on certain components

| Component     | Element Class        | classList properties                                                                    |
|---------------|----------------------|-----------------------------------------------------------------------------------------|
| Heading       | marccdown_heading    | classList, h1ClassList, h2ClassList, h3ClassList, h4ClassList, h5ClassList, h6ClassList |
| UnorderedList | marccdown_ulist_item | classList                                                                               |
| OrderedList   | marccdown_olist_item | classList                                                                               |
| Paragraph     | marccdown_paragraph  | classList                                                                               |

### Changing the Default Component

By default, if an element in the editor doesn't match any of the registered components it will treat it as a `Paragraph`, 
if you'd like to change which component is used by default you can pass it in as one of the options.

As it stands, there are no other components that really make sense to be the default, but for the purpose of
demonstration we'll use the `Heading` component
```js
import {Marccdown, Heading} from "marccdown"

const editor = new Marccdown(document.getElementById('myEditorId'), {
    defaultComponent: Heading
})
editor.init()
```

### Changing Used Components

By default, all components are active and will be checked for a match in the order they're shown in the 
Component Reference section above, if you only want to use a subset of these you can do so. 

The `defaultComponent` should only be included in the `components` option if you want to check for it
explicitly at a certain priority. 

***It's a bad idea to include the `Paragraph` component in the `components` option 
anywhere other than at the bottom, as it can match any given element.***

```js

import {Marccdown, Heading} from "marccdown"

const editor = new Marccdown(document.getElementById('myEditorId'), {
    components: {
        Heading
    }
})
editor.init()
```

### Registering Custom Components

By extending the base `Component` class you can register custom components yourself and use them in the editor.

Let's redefine a version of the `Heading` component to demonstrate this

```js
// MyHeading.js

import {Component} from "marccdown";

export default class MyHeading extends Component {
    // Add this class when an element matches this component
    static identityClass = 'marccdown_my_heading'

    // Consider the element a version of this component when its innerText starts with "# " or "# "
    static pattern = /^#{1,6} /m

    // Add these classes to the component, used primarily for styling
    static classList = ['text-lg', 'font-semibold']

    // New classList properties for variations of the component
    static h1ClassList = ['h1'];
    static h2ClassList = ['h2'];
    static h3ClassList = ['h3'];
    static h4ClassList = ['h4'];
    static h5ClassList = ['h5'];
    static h6ClassList = ['h6'];
    
    /**
     * A new method, to get the heading level
     */
    getLevel() {
        const matches = this.element.innerText.match(this.constructor.pattern);

        if (matches === null) {
            return 0; // Not a heading anymore
        }

        const hashes = matches[0].match(/#/gm)

        return hashes.length
    }

    /**
     * Overwrite default method entirely to check if the component should be reverted to the default
     */
    shouldRevertToDefault() {
        return this.getLevel() === 0;
    }
    
    /**
     * Handle transforming the element into an instance of the component
     * Retain the super call to deal with the default properties identityClass and classList
     * 
     * Then apply classes from component specific 
     */
    handle() {
        super.handle()
        
        const level = this.getLevel();
        const classListProp = `h${level}ClassList`

        if (typeof this.constructor[classListProp] !== "undefined") {
            this.element.classList.add(...this.constructor[classListProp])
        }
    }
}
```

We can then use this component in our `Marccdown` instance. 
As it stands, when providing the components to use, you must define all of them (except the `defaultComponent`, as that's defined separately).
Eventually this will be updated to allow adding, removing, or replacing single components. 

That said, you will always be able to completely override components in the manner shown.

```js
import {Marccdown, UnorderedList} from "marccdown"
import MyHeading from "./MyHeading.js"

const editor = new Marccdown(document.getElementById('myEditorId'), {
    components: {
        MyHeading,
        UnorderedList
    }
})
editor.init()
```

#### Repeatable Components

There is another type of component base class you can extend for repeatable functionality, the `RepeatableComponent`
class. `RepeatableComponent` extends `Component` itself, so the base functionality is the same, just with some extra 
tacked on.

Let's redefine the `UnorderedList` component to see how this works

```js
// MyUnorderedList.js

import RepeatableComponent from "marccdown";

export default class MyUnorderedList extends RepeatableComponent {
    // Add this class when an element matches this component
    static identityClass = 'marccdown_my_ulist_item'

    // Consider the element a version of this component when its innerText starts with "- "
    static pattern = /^- /m

    // Add these classes to the component, used primarily for styling
    static classList = ['ml-4']

    /**
     * The default content of an instance of the component, used when a new instance gets created on press of "Enter"
     * 
     * Also checked on the current instance when pressing "Enter", if it matches exactly then the component will be 
     * reverted to the default, and no new one will be created
     */
    static defaultContent = '- '
}
```

If you want to learn more about how the `RepeatableComponent` works, I'd suggest source diving!

Adding the component to the editor works the same way as for default components.

```js
import {Marccdown, Heading} from "marccdown"
import MyUnorderedList from "./MyUnorderedList.js"

const editor = new Marccdown(document.getElementById('myEditorId'), {
    components: {
        Heading,
        MyUnorderedList
    }
})
editor.init()
```