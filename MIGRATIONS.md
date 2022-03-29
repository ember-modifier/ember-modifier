# Migrations

- [4.0](#40)
  - [Function-based modifiers](#function-based-modifiers)
    - [When is this a breaking change?](#when-is-this-a-breaking-change)
  - [Class-based modifiers](#class-based-modifiers)
    - [Lifecycle hooks](#lifecycle-hooks)
      - [`didInstall()`](#didinstall)
      - [`didReceiveArguments()`](#didreceivearguments)
      - [`didUpdateArguments()`](#didupdatearguments)
      - [`willDestroy()`](#willdestroy)
    - [Fields](#fields)
      - [`element`](#element)
      - [`args`](#args)
      - [`isDestroyed` and `isDestroying`](#isdestroyed-and-isdestroying)
    - [When is this a breaking change?](#when-is-this-a-breaking-change-1)


## 4.0

Migrating to 4.0 requires making two significant changes to existing modifiers:

- adopting "lazy" semantics for the arguments a modifier consumes (both function-based and class-based modifiers)
- converting class-based modifiers to use a simplified API built around a single `modify` hook

Prior to v3.2.0, there was no way to use normal autotracking semantics: modifiers *always* eagerly consumed their arguments. That meant they re-ran any time the arguments changed, whether or not the modifier used an argument along any given path (which is unlike the rest of Ember). Starting with v3.2.0, you can progressively migrate each modifier to use normal "lazy" semantics, where modifiers only re-run if the state they *actually use* changes, both for arguments and for any other tracked state, for example from services they inject.

While `ember-modifier` is providing this in a backwards-compatible way so that you can migrate on a modifier-by-modifier basis, this change in semantics is *probably* a breaking change for people using your modifiers! If it is (as discussed in detail below), you should release a new major version after updating to use the new semantics. Additionally, for addon maintainers, note that if you release a version of your package after upgrading to 3.2.0, anyone using your modifiers will see deprecations, so you should plan to fix them *before* making that release.

The point is to give you a path to decouple the upgrade and the migration work:

- upgrade to 3.2.0
- migrate to the new APIs
- cut a new release (as a breaking change if necessary)
- upgrade to 4.0.0 when it comes out (no changes required for your code or your consumers)


### Function-based modifiers

For function-based modifiers, the only change you need to make is to pass a new options argument to the `modifier()` call.

Previously, you would write this:

```js
export default modifier((el, pos, named) => {
  // ...
});
```

The exactly equivalent behavior with the new options object is:

```js
export default modifier(
  (el, pos, named) => {
    // ...
  },
  { eager: true }
);
```

To migrate to the behavior required for v4, you need to pass `{ eager: false }`:

```js
export default modifier(
  (el, pos, named) => {
    // ...
  },
  { eager: false }
);
```


#### When is this a breaking change?

Previously, any time any argument passed to a modifier changed, Ember would re-run the modifier. This was true whether or not you ever used the argument. This means that updating to use the `{ eager: false }` version is a breaking change for your consumers *unless* you unconditionally used all the named and positional arguments arguments to your modifier in previously.[^technically]


### Class-based modifiers

For class-based modifiers,  you need to migrate to the new `modify()` API. *All* of the old lifecycle hooks are deprecated, as are the `element`, `args`, and `isDestroying` and `isDestroyed` fields. Additionally, the  new `modify()` hook which replaces the previous lifecycle hooks is *lazy*, like auto-tracking in general. After installation, it will only be re-executed when some tracked state it uses actually changes, where previously both `didReceiveArguments()` and `didUpdateArguments()` would be re-executed whenever any arguments to it changed, whether they used them or not.


#### Lifecycle hooks

##### `didInstall()`

For one-time setup done with the element in `didInstall()`, do the same setup in `modify()`. If it is cheap, you can just let it happen each time. If it is expensive, or if the operation is not [idempotent](https://en.wikipedia.org/wiki/Idempotence), you can set a flag to avoid doing it again:

```js
class Example extends Modifier {
  didSetup = false;

  modify(element, positional, named) {
    if (!this.didSetup) {
      // expensive setup
      this.didSetup = true;
    }

    // ...
  }
}
```


##### `didReceiveArguments()`

Since `didReceiveArguments()` ran on both installation and all subsequent times the modifier updated, you can switch directly to `modify()`. Remember that `modify()` does not eagerly consume its arguments, as discussed above, and that it receives the element and the named and positional arguments instead of requiring you to access class fields.

Before:

```js
class OnModifier extends Modifier {
  didReceiveArguments() {
    this.element.addEventListener(
      this.args.positional[0],
      this.args.positional[1],
      this.args.named.options,
    );
  }
}
```

After:

```js
class OnModifier extends Modifier {
  modify(element, [eventName, handler], { options }) {
    element.addEventListener(eventName, handler, options);
  }
}
```


##### `didUpdateArguments()`

In cases where you were using `didUpdateArguments()` to do something only when argument values *changed*, you can explicitly save the previous values and check them.

Before:

```js
class Example extends Modifier {
  didUpdateArguments() {
    // ...
  }
}
```

After:

```js
class Example extends Modifier {
  #handler;

  modify(element, [handler], { when: shouldRun }) {
    if (handler !== this.#handler) {
      this.#handler = handler;

      if (shouldRun) {
        handler(element.getAttribute('align'));
      }
    }
  }
}
```


##### `willDestroy()`

You can replace `willDestroy()` with Ember's [Destroyable API](https://api.emberjs.com/ember/4.2/modules/@ember%2Fdestroyable).

Before:

```js
import Modifier from 'ember-modifier';

export default class Example extends Modifier {
  willDestroy() {
    // some cleanup ...
  }
}
```

After:

```js
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

export default class Example extends Modifier {
  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, this.cleanup);
  }

  cleanup = () => {
    // some cleanup ...
  }
}
```

While this is slightly longer, it means the base class does not need a `willDestroy()` hook, so you only pay for a destructor when you actually need one!


#### Fields

##### `element`

The new `modify()` lifecycle hook always receives the element the modifier is installed on as its first argument, mirroring the API of function-based modifiers. Accordingly, anywhere you referenced `this.element`, you should simply refer to the `element` argument instead.

Before:

```js
import Modifier from 'ember-modifier';

export default class OnModifier extends Modifier {
  onClick;

  didReceiveArguments() {
    if (this.onClick) {
      this.element.removeEventListener('click', this.onClick);
    }

    const { onClick } = this.args.named;
    this.onClick = onClick;
    this.element.addEventListener('click', onClick);
  }
}
```

After:

```js
import Modifier from 'ember-modifier';

export default class OnModifier extends Modifier {
  onClick;

  modify(element, _, { onClick }) {
    element.removeEventListener('click', this.onClick);
    this.onClick = onClick;
    element.addEventListener('click', this.onClick);
  }
}
```

It may still be convenient to stash the element on the class! For example, you may want to provide a single teardown function which can work with the `element` and `registerDestructor`:

```js
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/modifier';

function cleanup(instance) {
  instance.element?.removeEventListener('click', instance.onClick);
}

export default class ClickModifier extends Modifier {
  element;
  onClick;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  modify(element, [onClick]) {
    // make them available for teardown
    this.element = element;
    this.onClick = onClick;

    element.addEventListener('click', onClick);
  }
}
```

However, this is now at the discretion of the author of a modifier, rather than being true for every single modifier, and there is no need to think about whether the element is present on the class in different lifecycle hooks, because it is always available as an argument.


##### `args`

The new `modify()` lifecycle hook receives the positional and named arguments to the modifier as its second and third parameters. Previously, these were available as `this.args.positional` and `this.args.named` respectively, and became available to use in that position after calling `super(owner, args)` in the constructor. Now, the args are always available in the `modify()` hook directly.

Before:

```js
import Modifier from 'ember-modifier';

export default class OnModifier extends Modifier {
  onClick;

  didReceiveArguments() {
    if (this.onClick) {
      this.element.removeEventListener('click', this.onClick);
    }

    const { onClick } = this.args.named;
    this.onClick = onClick;
    this.element.addEventListener('click', onClick);
  }
}
```

After:

```js
import Modifier from 'ember-modifier';

export default class OnModifier extends Modifier {
  onClick;

  modify(element, _, { onClick }) {
    if (this.onClick) {
      this.element.removeEventListener('click', this.onClick);
    }

    this.onClick = onClick;
    this.element.addEventListener('click', onClick);
  }
}
```


##### `isDestroyed` and `isDestroying`

You can replace `.isDestroyed` and `.isDestroying` checks with the corresponding functions from Ember's [Destroyable API](https://api.emberjs.com/ember/4.2/modules/@ember%2Fdestroyable).

Before:

```js
import Modifier from 'ember-modifier';

export default class Example extends Modifier {
  someAction = () => {
    if (!this.isDestroying) {
      // ...
    }
  }
}
```

After:

```js
import Modifier from 'ember-modifier';
import { isDestroying } from '@ember/destroyable';

export default class Example extends Modifier {
  someAction = () => {
    if (!isDestroying(this)) {
      // ...
    }
  }
}
```


#### When is this a breaking change?

Previously, any time any argument passed to a modifier changed, Ember would re-run the modifier. This was true whether or not you ever used the argument. This means that updating to use the `{ eager: false }` version is a breaking change for your consumers *unless* you unconditionally used all the named and positional arguments arguments to your modifier in `didReceiveArguments` or `didUpdateArguments`.[^technically]



[^technically]: Because modifiers re-ran any time any of their arguments changed, this left the *caller* in control of when the modifier reran. They could simply pass any tracked state as an argument to a modifier, whether the modifier used it or not or even knew it existed, and trigger this behavior. In practice, this is not relevant to the question of breaking changes. Anyone who did this was effectively relying on a quirk of Ember's initial modifier implementation to hack around the actual specified public API for a modifier!
