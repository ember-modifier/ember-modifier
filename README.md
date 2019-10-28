ember-modifier
==============================================================================

> This addon is the next iteration of both
> [ember-class-based-modifier](https://github.com/sukima/ember-class-based-modifier)
> and [ember-functional-modifiers](https://github.com/spencer516/ember-functional-modifiers).
> Some breaking changes to the APIs have been made, for a list of difference,
> see the [API differences](#api-differences) section.

> Huge thanks to @sukima and @spencer516 for their contributions! This project
> is based on their work, and wouldn't have been possible without them.


This addon provides an API for authoring [element modifiers](https://blog.emberjs.com/2019/03/06/coming-soon-in-ember-octane-part-4.html)
in Ember. It mirrors Ember's [helper](https://octane-guides-preview.emberjs.com/release/templates/writing-helpers)
API, with a form for writing simple _functional_ modifiers, and form for writing
more complicated _class_ modifiers.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.4 or above
* Ember CLI v2.13 or above
* Node.js v8 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-modifier
```


Usage
------------------------------------------------------------------------------

This addon does not provide any modifiers out of the box; instead, this library
allows you to write your own. There are two ways to write modifiers:

1. Functional modifiers
2. Class-based modifiers

```js
import Modifier, { modifier } from 'ember-modifier';
```

These are analogous to Ember's Helper APIs, `helper` and `Helper`.

### Functional Modifiers

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

Functional modifiers consist of a function that receives:

1. The `element`
2. An array of positional arguments
3. An object of named arguments

```js
modifier((element, positional, named) => { /* */ });
```

This function runs the first time when the element the modifier was applied to
is inserted into the DOM, and it _autotracks_ while running. Any values that it
accesses will be tracked, including the arguments it receives, and if any of
them changes, the function will run again.

The modifier can also optionally return a _destructor_. The destructor function
will be run just before the next update, and when the element is being removed
entirely. It should generally clean up the changes that the modifier made in the
first place.

#### Generating a Functional Modifier

To create a modifier (and a corresponding integration test), run:

```
ember g modifier scroll-top
```

#### Example without Cleanup

For example, if you wanted to implement your own `scrollTop` modifier (similar
to [this](https://github.com/emberjs/ember-render-modifiers#example-scrolling-an-element-to-a-position)),
you may do something like this:

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

export default makeFunctionalModifier(element => {
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

### Class Modifiers

Sometimes you may need to do something more complicated than what can be handled
by functional modifiers. For instance:

1. You may need to inject services and access them
2. You may need fine-grained control of updates, either for performance or
   convenience reasons, and don't want to teardown the state of your modifier
   every time only to set it up again.
3. You may need to store some local state within your modifier.

In these cases, you can use a _class modifier_ instead. Here's how you would
implement the `{{on}}` modifier with a class:

```js
import Modifier from 'ember-modifier';

export default class OnModifier extends Modifier {
  event = null;
  handler = null;

  // methods for reuse
  addEventListener() {
    let [event, handler] = this.args.positional;

    // Store the current event and handler for when we need to remove them
    this.event = event;
    this.handler = handler;

    this.element.addEventListener(event, handler);
  }

  removeEventListener() {
    let [event, handler] = this;

    if (event && handler) {
      this.element.removeEventListener(event, handler);

      this.event = null;
      this.handler = null;
    }
  }

  // lifecycle hooks
  didReceiveArguments() {
    this.removeEventListener();
    this.addEventListener();
  }

  willRemove() {
    this.removeEventListener();
  }
}
```

This may seem more complicated than the functional version, but that complexity
comes along with much more _control_.

As with functional modifiers, the lifecycle hooks of class modifiers are
_tracked_. When they run, they any values they access will be added to the
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

```js
// app/modifiers/scroll-position.js

import Modifier from 'ember-modifier';

export default class ScrollPositionModifier extends Modifier {
  get scrollPosition() {
    // get the first positional argument passed to the modifier
    //
    // {{scoll-position @someNumber relative=@someBoolean}}
    //                  ~~~~~~~~~~~
    //
    return this.args.positional[0];
  }

  get isRelative() {
    // get the named argument "relative" passed to the modifier
    //
    // {{scoll-position @someNumber relative=@someBoolean}}
    //                                       ~~~~~~~~~~~~
    //
    return this.args.named.relative
  }

  didReceiveArguments() {
    if(this.isRelative) {
      this.element.scrollTop += this.scrollPosition;
    } else {
      this.element.scrollTop = this.scrollPosition;
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
modifier is removed, you can use the `willRemove` hook.

For example, if you want to have your elements dance randomly on the page using
`setInterval`, but you wanted to make sure that was canceled when the modifier
was removed, you could do this:

```js
// app/modifiers/move-randomly.js

import { action } from '@ember/object';
import Modifier from 'ember-modifier';

const { random, round } = Math;
const DEFAULT_DELAY = 1000;

export default class MoveRandomlyModifier extends Modifier {
  setIntervalId = null;

  get delay() {
    // get the named argument "delay" passed to the modifier
    //
    // {{move-randomly delay=@someNumber}}
    //                       ~~~~~~~~~~~
    //
    return this.args.named.delay || DEFAULT_DELAY;
  }

  @action moveElement() {
    let top = round(random() * 500);
    let left = round(random() * 500);
    this.element.style.transform = `translate(${left}px, ${top}px)`;
  }

  didReceiveArguments() {
    if (this.setIntervalId !== null) {
      clearInterval(this.setIntervalId);
    }

    this.setIntervalId = setInterval(this.moveElement, this.delay);
  }

  willRemove() {
    clearInterval(this.setIntervalId);
    this.setIntervalId = null;
  }
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

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Modifier from 'ember-modifier';

export default class TrackClickModifier extends Modifier {
  @service metrics;

  get eventName() {
    // get the first positional argument passed to the modifier
    //
    // {{track-click "like-button-click" page="some page" title="some title"}}
    //               ~~~~~~~~~~~~~~~~~~~
    //
    return this.args.positional[0];
  }

  get options() {
    // get the named arguments passed to the modifier
    //
    // {{track-click "like-button-click" page="some page" title="some title"}}
    //                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    return this.args.named;
  }

  @action onClick() {
    this.metrics.trackEvent(this.eventName, this.options);
  }

  didInstall() {
    this.element.addEventListener('click', this.onClick, true);
  }

  willRemove() {
    this.element.removeEventListener('click', this.onClick, true);
  }
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
<dt><code>element</code></dt>
<dd>The DOM element the modifier is attached to.</dd>
<dt><code>args</code>: <code>{ positional: Array, named: Object }</code></dt>
<dd>The arguments passed to the modifier. <code>args.positional</code> is an array of positional arguments, and <code>args.named</code> is an object containing the named arguments.</dd>
<dt><code>isDestroying</code></dt>
<dd><code>true</code> if the modifier is in the process of being destroyed, or has already been destroyed.</dd>
<dt><code>isDestroyed</code></dt>
<dd><code>true</code> if the modifier has already been destroyed.</dd>
<dt><code>constructor(owner, args)</code>
<dd>Constructor for the modifier. You must call <code>super(...arguments)</code> before performing other initialization. The <code>element</code> is not yet available at this point (i.e. its value is <code>null</code> during construction).</dd>
<dt><code>didReceiveArguments()</code></dt>
<dd>Called when the modifier is installed <strong>and</strong> anytime the arguments are updated.</dd>
<dt><code>didUpdateArguments()</code></dt>
<dd>Called anytime the arguments are updated but <strong>not</strong> on the initial install. Called before <code>didReceiveArguments</code>.</dd>
<dt><code>didInstall()</code></dt>
<dd>Called when the modifier is installed on the DOM element. Called after <code>didReceiveArguments</code>.</dd>
<dt><code>willRemove()</code></dt>
<dd>Called when the DOM element is about to be destroyed; use for removing event listeners on the element and other similar clean-up tasks.</dd>
<dt><code>willDestroy()</code></dt>
<dd>Called when the modifier itself is about to be destroyed; use for teardown code. Called after <code>willRemove</code>. The <code>element</code> is no longer available at this point (i.e. its value is <code>null</code> during teardown).</dd>
</dl>

##### Lifecycle Summary

<table>
<thead><tr>
  <th></th>
  <th>Install</th>
  <th>Update</th>
  <th>Remove</th>
  <th><code>this.element</code></th>
  <th><code>this.args</code></th>
</tr></thead>
<tbody>
  <tr>
    <th><code>constructor()</code></th>
    <td>(1)</td>
    <td>❌</td>
    <td>❌</td>
    <td>❌</td>
    <td>after <code>super()</code></td>
  </tr>

  <tr>
    <th><code>didUpdateArguments()</code></th>
    <td>❌</td>
    <td>(1)</td>
    <td>❌</td>
    <td>✔️</td>
    <td>✔️</td>
  </tr>

  <tr>
    <th><code>didReceiveArguments()</code></th>
    <td>(2)</td>
    <td>(2)</td>
    <td>❌</td>
    <td>✔️</td>
    <td>✔️</td>
  </tr>

  <tr>
    <th><code>didInstall()</code></th>
    <td>(3)</td>
    <td>❌</td>
    <td>❌</td>
    <td>✔️</td>
    <td>✔️</td>
  </tr>



  <tr>
    <th><code>willRemove()</code></th>
    <td>❌</td>
    <td>❌</td>
    <td>(1)</td>
    <td>✔️</td>
    <td>✔️</td>
  </tr>

  <tr>
    <th><code>willDestroy()</code></th>
    <td>❌</td>
    <td>❌</td>
    <td>(2)</td>
    <td>❌</td>
    <td>✔️</td>
  </tr>
</tbody>
</table>

* (#) Indicates the order of invocation for the lifecycle event.
* ❌  Indicates that the method is not invoked for a given lifecycle / property is not available.
* ✔️  Indicates that the property is available during the invocation of the given method.

## TypeScript

Using the class API, you can use `.ts` instead of `.js` and it'll just work, as long as you do runtime checks to narrow the types of your args when you access them.

```ts
// app/modifiers/scroll-position.ts
import Modifier from 'ember-modifier';

export default class ScrollPositionModifier extends Modifier {
  // ...
}
```

But to avoid writing runtime checks, you can extend `Modifier` with your own args, similar to the way you would define your args for a Glimmer Component.

```ts
// app/modifiers/scroll-position.ts
import Modifier from 'ember-modifier';

interface ScrollPositionModifierArgs {
  positional: [number],
  named: {
    relative: boolean
  }
}

export default class ScrollPositionModifier extends Modifier<ScrollPositionModifierArgs> {
  get scrollPosition(): number {
    // get the first positional argument passed to the modifier
    //
    // {{scoll-position @someNumber relative=@someBoolean}}
    //                  ~~~~~~~~~~~
    //
    return this.args.positional[0];
  }

  get isRelative(): boolean {
    // get the named argument "relative" passed to the modifier
    //
    // {{scoll-position @someNumber relative=@someBoolean}}
    //                                       ~~~~~~~~~~~~
    //
    return this.args.named.relative
  }

  didReceiveArguments() {
    if(this.isRelative) {
      this.element.scrollTop += this.scrollPosition;
    } else {
      this.element.scrollTop = this.scrollPosition;
    }
  }
}
```

See [this pull request comment](https://github.com/sukima/ember-class-based-modifier/pull/5#discussion_r326687943) for a full discussion about using TypeScript with your Modifiers.

## API Differences

### API differences from [ember-functional-modifiers](https://github.com/spencer516/ember-functional-modifiers)

* Renamed package to `ember-modifier`
* Renamed `makeFunctionalModifier` to `modifier`, and to a named export instead of the default
* Removed `isRemoving` flag from modifier destructors. In cases where fine-grained control over the lifecycle is needed, class modifiers should be used instead.
* Removed service injection from functional modifiers. In cases where services are needed, class modifiers should be used instead.

### API differences from [ember-class-based-modifier](https://github.com/sukima/ember-class-based-modifier)

* Renamed package to `ember-modifier`
* Removed classic API

### API differences from [ember-oo-modifiers](https://github.com/sukima/ember-class-based-modifier/tree/maintenance/ember-oo-modifiers)

* Renamed package to `ember-modifier`.
* Removed classic API
* No `Modifier.modifier()` function.
* Arguments, both positional and named, are available on `this.args`.
* Named arguments do not become properties on the modifier instance.
* Arguments are not passed to life-cycle hooks.
* Renamed `didInsertElement` to `didInstall` and `willDestroyElement` to `willRemove`. This is to emphasize that when the modifier is installed or removed, the underlying element may not be freshly inserted or about to go away. Therefore, it is important to perform clean-up work in the `willRemove` to reverse any modifications you made to the element.
* Changed life-cycle hook order: `didReceiveArguments` fires before `didInstall`, and `didUpdateArguments` fires before `didReceiveArguments`, mirroring the classic component life-cycle hooks ordering.
* Added `willDestroy`, `isDestroying` and `isDestroyed` with the same semantics as Ember objects and Glimmer components.

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
