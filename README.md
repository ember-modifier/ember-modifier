ember-modifier
==============================================================================

This addon provides an API for authoring [element modifiers] in Ember. It
mirrors Ember's [helper] API, with variations for writing both simple
function-based modifiers and more complicated class-based modifiers.

[element modifiers]: https://blog.emberjs.com/2019/03/06/coming-soon-in-ember-octane-part-4.html
[helper]: https://octane-guides-preview.emberjs.com/release/templates/writing-helpers

**NOTE:** this is the README for the v4 release. For the v3 README, see [here](https://github.com/ember-modifier/ember-modifier/blob/v3/README.md).

- [Compatibility](#compatibility)
  - [TypeScript](#typescript)
- [Installation](#installation)
- [Philosophy](#philosophy)
  - [Whoa whoa whoa, hold on, what's a _"side effect"_?](#whoa-whoa-whoa-hold-on-whats-a-side-effect)
  - [Managing "side effects" effectively](#managing-side-effects-effectively)
- [Usage](#usage)
  - [Function-Based Modifiers](#function-based-modifiers)
    - [Generating a Function-Based Modifier](#generating-a-function-based-modifier)
    - [Example without Cleanup](#example-without-cleanup)
    - [Example with Cleanup](#example-with-cleanup)
  - [Class-Based Modifiers](#class-based-modifiers)
    - [Generating a Class Modifier](#generating-a-class-modifier)
    - [Example without Cleanup](#example-without-cleanup-1)
    - [Example with Cleanup](#example-with-cleanup-1)
    - [Example with Service Injection](#example-with-service-injection)
    - [API](#api)
- [TypeScript](#typescript-1)
  - [The `Signature` type](#the-signature-type)
  - [Examples with TypeScript](#examples-with-typescript)
    - [Function-based modifier](#function-based-modifier)
    - [Class-based](#class-based)
- [Contributing](#contributing)
- [License](#license)

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Embroider or ember-auto-import v2.0.0 or above (this is [v2 addon](https://emberjs.github.io/rfcs/0507-embroider-v2-package-format.html))

### TypeScript

This project follows the current draft of [the Semantic Versioning for TypeScript Types][semver] proposal.

- **Currently supported TypeScript versions:** v4.2 - v4.9
- **Compiler support policy:** [simple majors][sm]
- **Public API:** all published types not in a `-private` module are public

[semver]: https://github.com/emberjs/rfcs/blob/master/text/0730-semver-for-ts.md
[sm]: https://github.com/emberjs/rfcs/blob/master/text/0730-semver-for-ts.md#simple-majors


Installation
------------------------------------------------------------------------------

```
ember install ember-modifier
```


Philosophy
------------------------------------------------------------------------------

Modifiers are a basic primitive for interacting with the DOM in Ember. For
example, Ember ships with a built-in modifier, `{{on}}`:

```hbs
<button {{on "click" @onClick}}>
  {{@text}}
</button>
```

All modifiers get applied to elements directly this way (if you see a similar
value that _isn't_ in an element, it is probably a _helper_ instead), and they
are passed the element when applying their effects.

Conceptually, modifiers take _tracked, derived state_, and turn it into some
sort of _side effect_ related in some way to the DOM element they are applied
to.

### Whoa whoa whoa, hold on, what's a _"side effect"_?

A "side effect" is something that happens in programming all the time. Here's an
example of one in an Ember component that attempts to make a button like in the
first example, but without modifiers:

```js
// 🛑 DO NOT COPY THIS 🛑
import Component from '@glimmer/component';

export default class MyButton extends Component {
  get setupEventHandler() {
    document.querySelector('#my-button').addEventListener(this.args.onClick);

    return undefined;
  }
}
```
```hbs
<button id="#my-button">
  {{this.setupEventHandler}}

  {{@text}}
</button>
```

We can see by looking at the `setupEventListener` getter that it isn't actually
returning a value. Instead, it always returns `undefined`. However, it also adds
the `@onClick` argument as an _event listener_ to the button in the template
when the getter is run, as the template is rendering, which is a _side effect_
- it is an effect of running the code that doesn't have anything to do with the
"main" purpose of that code, in this case to return a dynamically computed
value. In fact, this code doesn't compute a value at all, so this component is
_misusing_ the getter in order to run its side effect whenever it is rendered in
the template.

Unmanaged side effects can make code very difficult to reason about, since any
function could be updating a value elsewhere. In fact, the code above is very
buggy:

1. If the `@onClick` argument ever changes, it won't remove the old event
   listener, it'll just keep adding new ones.
2. It won't remove the old event listener when the component is removed.
3. It uses a document element selector that may not be unique, and it has no
   guarantee that the element will exist when it runs.
4. It _will_ run in Fastboot/Server Side Rendering, where no DOM exists at all,
   and it'll throw errors because of this.

However, there are lots of times where its difficult to write code that
_doesn't_ have side effects. Sometimes it would mean having to rewrite a large
portion of an application. Sometimes, like in the case of modifying DOM, there
isn't a clear way to do it at _all_ with just getters and components.

This is where _modifiers_ come in. Modifiers exist as a way to bridge the gap
between derived state and side effects in way that is _contained_ and
_consistent_, so that users of a modifier don't have to think about them.

### Managing "side effects" effectively

Let's look again at our original example:

```hbs
<button {{on "click" @onClick}}>
  {{@text}}
</button>
```

We can see pretty clearly from this template that Ember will:

1. Create a `<button>` element
2. Append the contents of the `@text` argument to that button
3. Add a click event handler to the button that runs the `@onClick` argument

If `@text` or `@onClick` ever change, Ember will keep everything in sync for us.
We don't ever have to manually set `element.textContent` or update anything
ourselves. In this way, we can say the template is _declarative_ - it tells
Ember what we want the output to be, and Ember handles all of the bookkeeping
itself.

Here's how we could _implement_ the `{{on}}` modifier so that it always keeps
things in sync correctly:

```js
import { modifier } from 'ember-modifier';

export default modifier((element, [eventName, handler]) => {
  element.addEventListener(eventName, handler);

  return () => {
    element.removeEventListener(eventName, handler);
  }
});
```

Here, we setup the event listener using the positional parameters passed to the
modifier. Then, we return a _destructor_ - a function that _undoes_ our setup,
and is effectively the _opposite_ side effect. This way, if the `@onClick`
handler ever changes, we first teardown the first event listener we added -
leaving the element in its _original_ state before the modifier ever ran - and
then setup the new handler.

This is what allows us to treat the `{{on}}` modifier as if it were just like
the `{{@text}}` value we put in the template. While it _is_ side effecting, it
knows how to setup and teardown that side effect and manage its state. The side
effect is _contained_ - it doesn't escape into the rest of our application, it
doesn't cause other unrelated changes, and we can think about it as another
piece of declarative, derived state. Just another part of the template!

In general, when writing modifiers, especially general purpose/reusable
modifiers, they should be designed with this in mind. Which specific effects are
they trying to accomplish, how to manage them effectively, and how to do it in
a way that is _transparent_ to the user of the modifier.

Usage
------------------------------------------------------------------------------

This addon does not provide any modifiers out of the box. Instead, this library
allows you to write your own. There are two ways to write modifiers:

1. Function-based modifiers
2. Class-based modifiers

These are analogous to Ember's Helper APIs, `helper` and `Helper`.

### Function-Based Modifiers

`modifier` is an API for writing simple modifiers. For instance, you could
implement Ember's built-in `{{on}}` modifier like so with `modifier`:

```js
// /app/modifiers/on.js
import { modifier } from 'ember-modifier';

export default modifier((element, [eventName, handler]) => {
  element.addEventListener(eventName, handler);

  return () => {
    element.removeEventListener(eventName, handler);
  }
});
```

Function-based modifiers consist of a function that receives:

1. The `element`
2. An array of positional arguments
3. An object of named arguments

```js
modifier((element, positional, named) => { /* */ });
```

This function runs the first time when the element the modifier was applied to
is inserted into the DOM, and it _autotracks_ while running. Any tracked values
that it accesses will be tracked, including the arguments it receives, and if
any of them changes, the function will run again.[^changes]

The modifier can also optionally return a _destructor_. The destructor function
will be run just before the next update, and when the element is being removed
entirely. It should generally clean up the changes that the modifier made in the
first place.

[^changes]: As with autotracking in general, “changes” here actually means that the tracked property was set—even if it was set to the same value. This is because autotracking does not cache the *values* of properties, only the last time they changed. See [this blog post](https://v5.chriskrycho.com/journal/autotracking-elegant-dx-via-cutting-edge-cs/) for a deep dive on how it works!

#### Generating a Function-Based Modifier

To create a modifier (and a corresponding integration test), run:

```
ember g modifier scroll-top
```

#### Example without Cleanup

For example, if you wanted to implement your own `scrollTop` modifier (similar
to [this][scroll-example]), you may do something like this:

[scroll-example]: https://github.com/emberjs/ember-render-modifiers#example-scrolling-an-element-to-a-position

```js
// app/modifiers/scroll-top.js
import { modifier } from 'ember-modifier';

export default modifier((element, [scrollPosition]) => {
  element.scrollTop = scrollPosition;
})
```
```hbs
<div class="scroll-container" {{scroll-top @scrollPosition}}>
  {{yield}}
</div>
```

#### Example with Cleanup

If the functionality you add in the modifier needs to be torn down when the
element is removed, you can return a function for the teardown method.

For example, if you wanted to have your elements dance randomly on the page
using `setInterval`, but you wanted to make sure that was canceled when the
element was removed, you could do:

```js
// app/modifiers/move-randomly.js
import { modifier } from 'ember-modifier';

const { random, round } = Math;

export default modifier(element => {
  const id = setInterval(() => {
    const top = round(random() * 500);
    const left = round(random() * 500);
    element.style.transform = `translate(${left}px, ${top}px)`;
  }, 1000);

  return () => clearInterval(id);
});

```
```hbs
<button {{move-randomly}}>
  {{yield}}
</button>
```

### Class-Based Modifiers

Sometimes you may need to do something more complicated than what can be handled
by function-based modifiers. For instance:

1. You may need to inject services and access them
2. You may need fine-grained control of updates, either for performance or
   convenience reasons, and don't want to teardown the state of your modifier
   every time only to set it up again.
3. You may need to store some local state within your modifier.

In these cases, you can use a _class-based modifier_ instead. Here's how you
would implement the `{{on}}` modifier with a class:

```js
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

function cleanup(instance: OnModifier) {
  let { element, event, handler } = instance;

  if (element && event && handler) {
    element.removeEventListener(event, handler);

    instance.element = null;
    instance.event = null;
    instance.handler = null;
  }
}

export default class OnModifier extends Modifier {
  element = null;
  event = null;
  handler = null;

  modify(element, [event, handler]) {
    this.addEventListener(element, event, handler);
    registerDestructor(this, cleanup)
  }

  // methods for reuse
  addEventListener = (element, event, handler) => {
    // Store the current element, event, and handler for when we need to remove
    // them during cleanup.
    this.element = element;
    this.event = event;
    this.handler = handler;

    element.addEventListener(event, handler);
  };
}
```

While this is slightly more complicated than the function-based version, but
that complexity comes along with much more _control_.

As with function-based modifiers, the lifecycle hooks of class modifiers are
_tracked_. When they run, then any values they access will be added to the
modifier, and the modifier will update if any of those values change.

#### Generating a Class Modifier

To create a modifier (and a corresponding integration test), run:

```
ember g modifier scroll-top --class
```

#### Example without Cleanup

For example, let's say you want to implement your own `{{scroll-position}}`
modifier (similar to [this](https://github.com/emberjs/ember-render-modifiers#example-scrolling-an-element-to-a-position)).

This modifier can be attached to any element and accepts a single positional
argument. When the element is inserted, and whenever the argument is updated, it
will set the element's `scrollTop` property to the value of its argument.

(Note that this example does not require the use of a class, and could be
implemented equally well with a function-based modifier!)

```js
// app/modifiers/scroll-position.js
import Modifier from 'ember-modifier';

export default class ScrollPositionModifier extends Modifier {
  modify(element, [scrollPosition], { relative }) {
    if(relative) {
      element.scrollTop += scrollPosition;
    } else {
      element.scrollTop = scrollPosition;
    }
  }
}
```

Usage:

```handlebars
{{!-- app/components/scroll-container.hbs --}}

<div
  class="scroll-container"
  style="width: 300px; heigh: 300px; overflow-y: scroll"
  {{scroll-position this.scrollPosition relative=false}}
>
  {{yield this.scrollToTop}}
</div>
```

```js
// app/components/scroll-container.js

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ScrollContainerComponent extends Component {
  @tracked scrollPosition = 0;

  @action scrollToTop() {
    this.scrollPosition = 0;
  }
}
```

```handlebars
{{!-- app/templates/application.hbs --}}

<ScrollContainer as |scroll|>
  A lot of content...

  <button {{on "click" scroll}}>Back To Top</button>
</ScrollContainer>
```

#### Example with Cleanup

If the functionality you add in the modifier needs to be torn down when the
modifier is removed, you can use `registerDestructor` from `@ember/destroyable`.

For example, if you want to have your elements dance randomly on the page using
`setInterval`, but you wanted to make sure that was canceled when the modifier
was removed, you could do this:

```js
// app/modifiers/move-randomly.js

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable'

const { random, round } = Math;
const DEFAULT_DELAY = 1000;

function cleanup(instance) {
  if (instance.setIntervalId !== null) {
    clearInterval(instance.setIntervalId);
    instance.setIntervalId = null;
  }
}

export default class MoveRandomlyModifier extends Modifier {
  element = null;
  setIntervalId = null;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  modify(element, _, { delay }) {
    // Save off the element the first time for convenience with #moveElement
    if (!this.element) {
      this.element = element;
    }

    // Reset from any previous state.
    cleanup(this);

    this.setIntervalId = setInterval(this.#moveElement, delay ?? DEFAULT_DELAY);
  }

  #moveElement = (element) => {
    let top = round(random() * 500);
    let left = round(random() * 500);
    this.element.style.transform = `translate(${left}px, ${top}px)`;
  };
}
```

Usage:

```hbs
<div {{move-randomly}}>
  Catch me if you can!
</div>
```

#### Example with Service Injection

You can also use services into your modifier, just like any other class in Ember.

For example, suppose you wanted to track click events with `ember-metrics`:

```js
// app/modifiers/track-click.js

import { inject as service } from '@ember/service';
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

function cleanup(instance) {
  instance.element?.removeEventListener('click', instance.onClick, true);
}

export default class TrackClick extends Modifier {
  @service metrics;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, this.cleanup);
  }

  modify(element, [eventName], options) {
    this.element = element;
    this.eventName = eventName;
    this.options = options;

    this.cleanup();
    element.addEventListener('click', this.onClick, true);
  }

  onClick = () => {
    this.metrics.trackEvent(this.eventName, this.options);
  };
}
```

Usage:

```hbs
<button {{track-click "like-button-click" page="some page" title="some title"}}>
  Click Me!
</button>
```

#### API

<dl>
<dt><code>constructor(owner, args)</code>
<dd>Constructor for the modifier. You must call <code>super(...arguments)</code> before performing other initialization.</dd>
<dt><code>modify(element, positionalArgs, namedArgs)</code>
<dd>The primary hook for running a modifier. It gets called when the modifier is installed on the element, and any time any tracked state it uses changes. That tracked state can be from its arguments, which are auto-tracked, or from any other kind of tracked state, including but not limited to state on injected services.</dd>
</dl>

## TypeScript

Both the function- and class-based APIs can be used with TypeScript!

Before checking out the [Examples with Typescript](#examples-with-type-script) below, there is an important caveat you should understand about type safety!

There are, today, two basic approaches you can take to dealing with your modifier's arguments and element in a type safe way:

1. You can use a type definition which specifies those for the outside world, relying on tooling like [Glint][glint] to check that the invocation is correct, and treat input as safe accordingly.
2. You can provide the minimal public interface which *all* modifiers conform to, and do runtime type checking with `assert` calls to make your internal implementation safe.

If you have a code base which is strictly typed from end to end, including with template type checking via Glint, then (1) is a great choice. If you have a mixed code base, or are publishing an addon for others to use, then [it's usually best to do both (1) *and* (2)][safe-ts-libs]!

[glint]: https://github.com/typed-ember/glint
[safe-ts-libs]: https://v5.chriskrycho.com/journal/writing-robust-typescript-libraries/s

To handle runtime checking, for non-type-checked templates (including projects not yet using Glint or supporting external callers), you should *act* as though the arguments passed to your modifier can be *anything*. They’re typed as `unknown` by default, which means by default TypeScript will *require* you to work out the type passed to you at runtime. For example, with the `ScrollPositionModifier` shown above, you can combine TypeScript’s [type narrowing] with the default types for the class to provide runtime errors if the caller passes the wrong types, while providing safety throughout the rest of the body of the modifier. Here, `modify` would be *guaranteed* to have the correct types for `scrollPosition` and `relative`:

[type narrowing]: https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types

```ts
import Modifier from 'ember-modifier';
import { assert } from '@ember/debug';

export class ScrollPositionModifier extends Modifier {
  modify(element, [scrollPosition], { relative }) {
    assert(,
      `first argument to 'scroll-position' must be a number, but ${scrollPosition} was ${typeof scrollPosition}`,
      typeof scrollPosition === "number"
    );

    assert(
      `'relative' argument to 'scroll-position' must be a boolean, but ${relative} was ${typeof relative}`,
      typeof relative === "boolean"
    );

    if (relative) {
      element.scrollTop += scrollPosition;
    } else {
      element.scrollTop = scrollPosition;
    }
  }
}
```

If you were writing for a fully-typed context, you can define your `Modifier` with a `Signature` interface, similar to the way you would define your signature for a Glimmer Component:

```ts
// app/modifiers/scroll-position.ts
import Modifier from 'ember-modifier';

interface ScrollPositionModifierSignature {
  Args: {
    Positional: [number];
    Named: {
      relative: boolean;
    };
  };
}

export default class ScrollPositionModifier
    extends Modifier<ScrollPositionModifierSignature> {
  modify(element, [scrollPosition], { relative }) {
    if (relative) {
      element.scrollTop += scrollPosition;
    } else {
      element.scrollTop = scrollPosition;
    }
  }
}
```

Besides supporting integration with [Glint][glint], this also provides nice hooks for documentation tooling. Note, however, that it can result in *much worse* feedback in tests or at runtime if someone passes the wrong kind of arguments to your modifier and you *haven't* included assertions: users who pass the wrong thing will just have the modifier fail. For example, if you fail to pass the positional argument, `scrollPosition` would simply be `undefined`, and then `element.scrollTop` could end up being set to `NaN`. Whoops! For that reason, if your modifier will be used by non-TypeScript consumers, you should both publish the types for it *and* add dev-time assertions:

```ts
// app/modifiers/scroll-position.ts
import Modifier from 'ember-modifier';

interface ScrollPositionModifierSignature {
  Args: {
    Positional: [scrollPosition: number];
    Named: {
      relative: boolean;
    };
  };
  Element: Element; // not required: it'll be set by default
}

export default class ScrollPositionModifier
    extends Modifier<ScrollPositionModifierSignature> {
  modify(element, [scrollPosition], { relative }) {
    assert(,
      `first argument to 'scroll-position' must be a number, but ${scrollPosition} was ${typeof scrollPosition}`,
      typeof scrollPosition === "number"
    );

    assert(
      `'relative' argument to 'scroll-position' must be a boolean, but ${relative} was ${typeof relative}`,
      typeof relative === "boolean"
    );

    if (relative) {
      element.scrollTop += scrollPosition;
    } else {
      element.scrollTop = scrollPosition;
    }
  }
}
```

### The `Signature` type

The `Signature` for a modifier is the combination of the positional and named arguments it receives and the element to which it may be applied.

```ts
interface Signature {
  Args: {
    Named: {
      [argName: string]: unknown;
    };
    Positional: unknown[];
  };
  Element: Element;
}
```

When writing a signature yourself, all of those are optional: the types for modifiers will fall back to the correct defaults of `Element`, an object for named arguments, and an array for positional arguments. You can apply a signature when defining either a function-based or a class-based modifier.

In a function-based modifier, the callback arguments will be inferred from the signature, so you do not need to specify the types twice:

```ts
interface MySignature {
  Element: HTMLMediaElement;
  Args: {
    Named: {
      when: boolean;
    };
    Positional: [];
  };
}

const play = modifier<MySignature>((el, _, { when: shouldPlay }) => {
  if (shouldPlay) {
    el.play();
  } else {
    el.pause();
  }
})
```

You never *need* to specify a signature in this way for a function-based modifier: you can simply write the types inline instead:

```ts
const play = modifier(
  (el: HTMLMediaElement, _: [], { when: shouldPlay }: { when: boolean}) => {
    if (shouldPlay) {
      el.play();
    } else {
      el.pause();
    }
  }
);
```

However, the explicit `modifier<Signature>(...)` form is tested to keep working, since it can be useful for documentation!

The same basic approach works with a class-based modifier:

```ts
interface MySignature {
  // ...
}

export default class MyModifier extends Modifier<MySignature> {
  // ...
}
```

In that case, the `element` and `args` will always have the right types throughout the body. Since the type of `args` in the constructor are derived from the signature, you can use the `ArgsFor` type helper to avoid having to write the type out separately:

```ts
import Modifier, { ArgsFor } from 'ember-modifier';

interface MySignature {
  // ...
}

export default class MyModifier extends Modifier<MySignature> {
  constructor(owner: unknown, args: ArgsFor<MySignature>) {
    // ...
  }
}
```

`ArgsFor` isn't magic: it just takes the `Args` from the `Signature` you provide and turns it into the right shape for the constructor: the `Named` type ends up as the `named` field and the `Positional` type ends up as the type for `args.positional`, so you could write it out yourself if you preferred:

```ts
import Modifier from 'ember-modifier';

interface MySignature {
  // ...
}

export default class MyModifier extends Modifier<MySignature> {
  constructor(
    owner: unknown,
    args: {
      named: MySignature['Args']['Named'];
      positional: MySignature['Args']['Positional'];
    }
  ) {
    // ...
  }
}
```

### Examples with TypeScript

#### Function-based modifier

Let’s look at a variant of the `move-randomly` example from above, implemented in TypeScript, and now requiring a named argument, the maximum offset. Using the recommended combination of types and runtime type-checking, it would look like this:

```ts
// app/modifiers/move-randomly.js
import { modifier } from 'ember-modifier';
import { assert } from '@ember/debug';

const { random, round } = Math;

export default modifier(
  (element: HTMLElement, _: [], named: { maxOffset: number }
) => {
  assert(
    'move-randomly can only be installed on HTML elements!',
    element instanceof HTMLElement
  );

  const { maxOffset } = named;
  assert(
    `The 'max-offset' argument to 'move-randomly' must be a number, but was ${typeof maxOffset}`,
    typeof maxOffset === "number"
  );

  const id = setInterval(() => {
    const top = round(random() * maxOffset);
    const left = round(random() * maxOffset);
    element.style.transform = `translate(${left}px, ${top}px)`;
  }, 1000);

  return () => clearInterval(id);
});
```

A few things to notice here:

1.  TypeScript correctly infers the *base* types of the arguments for the function passed to the modifier; you don't need to specify what `element` or `positional` or `named` are unless you are doing like we are in this example and providing a usefully more-specific type to callers.

2.  If we returned a teardown function which had the wrong type signature, that would also be an error.

    If we return a value instead of a function, for example:

    ```ts
    export default modifier((element, _, named) => {
      // ...

      return id;
    });
    ```

    TypeScript will report:

    > ```
    > Type 'Timeout' is not assignable to type 'void | Teardown'.
    > ```

    Likewise, if we return a function with the wrong signature, we will see the same kinds of errors. If we expected to receive an argument in the teardown callback, like this:

    ```ts
    export default modifier((element, _, named) => {
      // 

      return (interval: number) => clearTimeout(interval);
    });
    ```

    TypeScript will report:

    > ```
    > Type '(interval: number) => void' is not assignable to type 'void | Teardown'.
    > ```

####  Class-based

To support correctly typing `args` in the `constructor` for the case where you do runtime type checking, we supply an `ArgsFor` type utility. (This is useful because the `Signature` type, matching Glimmer Component and other "invokable" items in Ember/Glimmer, has capital letters for the names of the types, while `args.named` and `args.positional` are lower-case.) Here’s how that would look with a fully typed modifier that alerts "This is a typesafe modifier!" an amount of time after receiving arguments that depends on the length of the first argument and an *optional* multiplier (a nonsensical thing to do, but one that illustrates a fully type-safe class-based modifier):

```ts
import Modifier, { ArgsFor, PositionalArgs, NamedArgs } from 'ember-modifier';
import { assert } from '@ember/debug';

interface NeatSignature {
  Args: {
    Named: {
      multiplier?: number;
    };
    Positional: [string];
  }
}


function cleanup(instance: Neat) => {
  if (instance.interval) {
    clearInterval(instance.interval);
  }
}

export default class Neat extends Modifier<NeatSignature> {
  interval?: number;

  constructor(owner: unknown, args: ArgsFor<NeatSignature>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  modify(
    element: Element,
    [lengthOfInput]: PositionalArgs<NeatSignature>,
    { multiplier }: NamedArgs<NeatSignature>
  ) {
    assert(
  	  `positional arg must be 'string' but was ${typeof lengthOfInput}`,
  	  typeof lengthOfInput === 'string'
  	);

    assert(
    	`'multiplier' arg must be a number but was ${typeof multiplier}`,
    	multiplier ? typeof multiplier === "number" : true
    );

    multiplier = modifier ?? 1000;

    let updateTime = multiplier * lengthOfInput;
    this.interval = setInterval(() => {
      element.innerText =
        `Behold, a type safe modifier moved after ${updateTime / 1000}s`;
    }, updateTime)
  }
}
```

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
