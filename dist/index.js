import { setOwner } from '@ember/application';
import { capabilities, setModifierManager } from '@ember/modifier';
import { destroy } from '@ember/destroyable';

/**
 * The state bucket used throughout the life-cycle of the modifier. Basically a
 * state *machine*, where the framework calls us with the version we hand back
 * to it at each phase. The two states are the two `extends` versions of this
 * below.
 *
 * @internal
 */

/**
 * The `State` after calling `createModifier`, and therefore the state available
 * at the start of `InstallModifier`.
 * @internal
 */

/**
 * The `State` after calling `installModifier`, and therefore the state
 * available in all `updateModifier` calls and in `destroyModifier`.
 * @internal
 */

// Wraps the unsafe (b/c it mutates, rather than creating new state) code that
// TS does not yet understand.
function installElement$1(state, element) {
  // SAFETY: this cast represents how we are actually handling the state machine
  // transition: from this point forward in the lifecycle of the modifier, it
  // always behaves as `InstalledState<S>`. It is safe because, and *only*
  // because, we immediately initialize `element`. (We cannot create a new state
  // from the old one because the modifier manager API expects mutation of a
  // single state bucket rather than updating it at hook calls.)
  const installedState = state;
  installedState.element = element;
  return installedState;
}
class ClassBasedModifierManager {
  capabilities = capabilities('3.22');
  constructor(owner) {
    this.owner = owner;
  }
  createModifier(modifierClass, args) {
    const instance = new modifierClass(this.owner, args);
    return {
      instance,
      element: null
    };
  }
  installModifier(createdState, element, args) {
    const state = installElement$1(createdState, element);
    state.instance.modify(element, args.positional, args.named);
  }
  updateModifier(state, args) {
    state.instance.modify(state.element, args.positional, args.named);
  }
  destroyModifier({
    instance
  }) {
    destroy(instance);
  }
}

// Preserve the signature on a class-based modifier, so it can be plucked off
// later (by e.g. Glint), using interface merging with an opaque item to
// preserve it in the type system. The fact that it's an empty interface is
// actually the point: it *only* hooks the type parameter into the opaque
// (nominal) type. Note that this is distinct from the function-based modifier
// type intentionally, because it is actually the static class side of a
// class-based modifier which corresponds to the result of calling `modifier()`
// with a callback defining a function-based modifier.
// eslint-disable-next-line @typescript-eslint/no-empty-interface

/**
 * A base class for modifiers which need more capabilities than function-based
 * modifiers. Useful if, for example:
 *
 * 1. You need to inject services and access them
 * 2. You need fine-grained control of updates, either for performance or
 *    convenience reasons, and don't want to teardown the state of your modifier
 *    every time only to set it up again.
 * 3. You need to store some local state within your modifier.
 *
 * The lifecycle hooks of class modifiers are tracked. When they run, they any
 * values they access will be added to the modifier, and the modifier will
 * update if any of those values change.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class ClassBasedModifier {
  // `args` is passed here for the sake of subclasses to have access to args in
  // their constructors while having constructors which are properly asssignable
  // for the superclass.
  /**
   *
   * @param owner An instance of an Owner (for service injection etc.).
   * @param args The positional and named arguments passed to the modifier.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(owner, args) {
    setOwner(this, owner);
  }

  /**
   * Called when the modifier is installed and any time any tracked state used
   * in the modifier changes.
   *
   * If you need to do first-time-only setup, create a class field representing
   * the initialization state and check it when running the hook. That is also
   * where and when you should use `registerDestructor` for any teardown you
   * need to do. For example:
   *
   * ```js
   * function disconnect(instance) {
   *  instance.observer?.disconnect();
   * }
   *
   * class IntersectionObserver extends Modifier {
   *   observer;
   *
   *   constructor(owner, args) {
   *     super(owner, args);
   *     registerDestructor(this, disconnect);
   *   }
   *
   *   modify(element, callback, options) {
   *     disconnect(this);
   *
   *     this.observer = new IntersectionObserver(callback, options);
   *     this.observer.observe(element);
   *   }
   * }
   * ```
   *
   * @param element The element to which the modifier is applied.
   * @param positional The positional arguments to the modifier.
   * @param named The named arguments to the modifier.
   */
  modify( /* eslint-disable @typescript-eslint/no-unused-vars */
  element, positional, named
  /* eslint-enable @typescript-eslint/no-unused-vars */) {
    /* no op, for subclassing */
  }
}
setModifierManager(owner => new ClassBasedModifierManager(owner), ClassBasedModifier);

// Wraps the unsafe (b/c it mutates, rather than creating new state) code that
// TS does not yet understand.
function installElement(state, element) {
  // SAFETY: this cast represents how we are actually handling the state machine
  // transition: from this point forward in the lifecycle of the modifier, it
  // always behaves as `InstalledState<S>`. It is safe because, and *only*
  // because, we immediately initialize `element`. (We cannot create a new state
  // from the old one because the modifier manager API expects mutation of a
  // single state bucket rather than updating it at hook calls.)
  const installedState = state;
  installedState.element = element;
  return installedState;
}
class FunctionBasedModifierManager {
  capabilities = capabilities('3.22');
  createModifier(instance) {
    return {
      element: null,
      instance
    };
  }
  installModifier(createdState, element, args) {
    const state = installElement(createdState, element);
    const {
      positional,
      named
    } = args;
    const teardown = createdState.instance(element, positional, named);
    if (typeof teardown === 'function') {
      state.teardown = teardown;
    }
  }
  updateModifier(state, args) {
    if (typeof state.teardown === 'function') {
      state.teardown();
    }
    const teardown = state.instance(state.element, args.positional, args.named);
    if (typeof teardown === 'function') {
      state.teardown = teardown;
    }
  }
  destroyModifier(state) {
    if (typeof state.teardown === 'function') {
      state.teardown();
    }
  }
  getDebugName(state) {
    return state.instance.toString();
  }
  getDebugInstance(state) {
    return state;
  }
}

// Provide a singleton manager.
const MANAGER = new FunctionBasedModifierManager();

// This type exists to provide a non-user-constructible, non-subclassable
// type representing the conceptual "instance type" of a function modifier.
// The abstract field of type `never` prevents subclassing in userspace of
// the value returned from `modifier()`. By extending `Modifier<S>`, any
// augmentations of the `Modifier` type performed by tools like Glint will
// also apply to function-based modifiers as well.

// This provides a type whose only purpose here is to represent the runtime
// type of a function-based modifier: a virtually opaque item. The fact that it's
// a bare constructor type allows `modifier()` to preserve type parameters from
// a generic function it's passed, and by making it abstract and impossible to
// subclass (see above) we prevent users from attempting to instantiate the return
// value from a `modifier()` call.

/**
 * The (optional) return type for a modifier which needs to perform some kind of
 * cleanup or teardown -- for example, removing an event listener from an
 * element besides the one passed into the modifier.
 */

/**
 * An API for writing simple modifiers.
 *
 * This function runs the first time when the element the modifier was applied
 * to is inserted into the DOM, and it *autotracks* while running. Any values
 * that it accesses will be tracked, including any of its arguments that it
 * accesses, and if any of them changes, the function will run again.
 *
 * **Note:** this will *not* automatically rerun because an argument changes. It
 * will only rerun if it is *using* that argument (the same as with auto-tracked
 * state in general).
 *
 * The modifier can also optionally return a *destructor*. The destructor
 * function will be run just before the next update, and when the element is
 * being removed entirely. It should generally clean up the changes that the
 * modifier made in the first place.
 *
 * @param fn The function which defines the modifier.
 */
// This overload allows users to write types directly on the callback passed to
// the `modifier` function and infer the resulting type correctly.

/**
 * An API for writing simple modifiers.
 *
 * This function runs the first time when the element the modifier was applied
 * to is inserted into the DOM, and it *autotracks* while running. Any values
 * that it accesses will be tracked, including any of its arguments that it
 * accesses, and if any of them changes, the function will run again.
 *
 * **Note:** this will *not* automatically rerun because an argument changes. It
 * will only rerun if it is *using* that argument (the same as with auto-tracked
 * state in general).
 *
 * The modifier can also optionally return a *destructor*. The destructor
 * function will be run just before the next update, and when the element is
 * being removed entirely. It should generally clean up the changes that the
 * modifier made in the first place.
 *
 * @param fn The function which defines the modifier.
 */
// This overload allows users to provide a `Signature` type explicitly at the
// modifier definition site, e.g. `modifier<Sig>((el, pos, named) => {...})`.
// **Note:** this overload must appear second, since TS' inference engine will
// not correctly infer the type of `S` here from the types on the supplied
// callback.

// This is the runtime signature; it performs no inference whatsover and just
// uses the simplest version of the invocation possible since, for the case of
// setting it on the modifier manager, we don't *need* any of that info, and
// the two previous overloads capture all invocations from a type perspective.
function modifier(fn, options) {
  fn.toString = () => options?.name || fn.name;
  // SAFETY: the cast here is a *lie*, but it is a useful one. The actual return
  // type of `setModifierManager` today is `void`; we pretend it actually
  // returns an opaque `Modifier` type so that we can provide a result from this
  // type which is useful to TS-aware tooling (e.g. Glint).
  return setModifierManager(() => MANAGER, fn);
}

/**
 * @internal
 */

export { ClassBasedModifier as default, modifier };
//# sourceMappingURL=index.js.map
