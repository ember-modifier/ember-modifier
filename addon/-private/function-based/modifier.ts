import { deprecate } from '@ember/debug';
import { setModifierManager } from '@ember/modifier';
import {
  ElementFor,
  ModifierArgs,
  NamedArgs,
  PositionalArgs,
} from '../signature';
import Modifier from '../class/modifier';
import FunctionBasedModifierManager from './modifier-manager';

// Provide a singleton manager for each of the options. (If we extend this to
// many more options in the future, we can revisit, but for now this means we
// only ever allocate two managers.)
const EAGER_MANAGER = new FunctionBasedModifierManager({ eager: true });
const LAZY_MANAGER = new FunctionBasedModifierManager({ eager: false });

// This type exists to provide a non-user-constructible, non-subclassable
// type representing the conceptual "instance type" of a function modifier.
// The abstract field of type `never` prevents subclassing in userspace of
// the value returned from `modifier()`. By extending `Modifier<S>`, any
// augmentations of the `Modifier` type performed by tools like Glint will
// also apply to function-based modifiers as well.
export declare abstract class FunctionBasedModifierInstance<
  S
> extends Modifier<S> {
  protected abstract __concrete__: never;
}

// This provides a type whose only purpose here is to represent the runtime
// type of a function-based modifier: a virtually opaque item. The fact that it's
// a bare constructor type allows `modifier()` to preserve type parameters from
// a generic function it's passed, and by making it abstract and impossible to
// subclass (see above) we prevent users from attempting to instantiate the return
// value from a `modifier()` call.
export type FunctionBasedModifier<S> =
  abstract new () => FunctionBasedModifierInstance<S>;

/**
 * The (optional) return type for a modifier which needs to perform some kind of
 * cleanup or teardown -- for example, removing an event listener from an
 * element besides the one passed into the modifier.
 */
export type Teardown = () => unknown;

/**
 * An API for writing simple modifiers.
 *
 * This function runs the first time when the element the modifier was applied
 * to is inserted into the DOM, and it *autotracks* while running. Any values
 * that it accesses will be tracked, and if any of them changes, the function
 * will run again.
 *
 * **Note:** this will rerun if any of its arguments change, *whether or not you
 * access them*. This is legacy behavior and you should switch to using the
 * `{ eager: false }` variant, which has normal auto-tracking semantics.
 *
 * The modifier can also optionally return a *destructor*. The destructor
 * function will be run just before the next update, and when the element is
 * being removed entirely. It should generally clean up the changes that the
 * modifier made in the first place.
 *
 * @deprecated Until 4.0. Calling `modifier()` without an options argument is
 *   deprecated. It is supported until 4.0 so that existing modifiers can be
 *   migrated individually. Please update your function-based modifiers to pass
 *   `{ eager: false }`.
 *
 * @param fn The function which defines the modifier.
 */
// This overload allows users to write types directly on the callback passed to
// the `modifier` function and infer the resulting type correctly.
export default function modifier<
  E extends Element,
  P extends unknown[],
  N extends object = Record<string, unknown>
>(
  fn: (element: E, positional: P, named: N) => void | Teardown
): FunctionBasedModifier<{
  Args: { Named: N; Positional: P };
  Element: E;
}>;

/**
 * An API for writing simple modifiers.
 *
 * This function runs the first time when the element the modifier was applied
 * to is inserted into the DOM, and it *autotracks* while running. Any values
 * that it accesses will be tracked, and if any of them changes, the function
 * will run again.
 *
 * **Note:** this will rerun if any of its arguments change, *whether or not you
 * access them*. This is legacy behavior and you should switch to using the
 * `{ eager: false }` variant, which has normal auto-tracking semantics.
 *
 * The modifier can also optionally return a *destructor*. The destructor
 * function will be run just before the next update, and when the element is
 * being removed entirely. It should generally clean up the changes that the
 * modifier made in the first place.
 *
 * @deprecated Until 4.0. Calling `modifier()` with `{ eager: true }` is
 *   deprecated. It is supported until 4.0 so that existing modifiers can be
 *   migrated individually. Please update your function-based modifiers to pass
 *   `{ eager: false }`.
 *
 * @param fn The function which defines the modifier.
 * @param options Configuration for the modifier.
 */
// This overload allows users to write types directly on the callback passed to
// the `modifier` function and infer the resulting type correctly.
export default function modifier<
  E extends Element,
  P extends unknown[],
  N extends object = Record<string, unknown>
>(
  fn: (element: E, positional: P, named: N) => void | Teardown,
  options: { eager: true }
): FunctionBasedModifier<{
  Args: { Named: N; Positional: P };
  Element: E;
}>;

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
 * @param options Configuration for the modifier.
 */
// This overload allows users to write types directly on the callback passed to
// the `modifier` function and infer the resulting type correctly.
export default function modifier<
  E extends Element,
  P extends unknown[],
  N extends object = Record<string, unknown>
>(
  fn: (element: E, positional: P, named: N) => void | Teardown,
  options: { eager: false }
): FunctionBasedModifier<{
  Args: { Named: N; Positional: P };
  Element: E;
}>;

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
 * @param options Configuration for the modifier.
 */
// This overload allows users to provide a `Signature` type explicitly at the
// modifier definition site, e.g. `modifier<Sig>((el, pos, named) => {...})`.
// **Note:** this overload must appear second, since TS' inference engine will
// not correctly infer the type of `S` here from the types on the supplied
// callback.
export default function modifier<S>(
  fn: (
    element: ElementFor<S>,
    positional: PositionalArgs<S>,
    named: NamedArgs<S>
  ) => void | Teardown,
  options: { eager: false }
): FunctionBasedModifier<{
  Element: ElementFor<S>;
  Args: {
    Named: NamedArgs<S>;
    Positional: PositionalArgs<S>;
  };
}>;

// This is the runtime signature; it performs no inference whatsover and just
// uses the simplest version of the invocation possible since, for the case of
// setting it on the modifier manager, we don't *need* any of that info, and
// the two previous overloads capture all invocations from a type perspective.
export default function modifier(
  fn: (
    element: Element,
    positional: unknown[],
    named: object
  ) => void | Teardown,
  options: { eager: boolean } = { eager: true }
): FunctionBasedModifier<{
  Element: Element;
  Args: {
    Named: object;
    Positional: unknown[];
  };
}> {
  deprecate(
    `ember-modifier (for ${fn.name ?? fn} at ${
      new Error().stack
    }): creating a function-based modifier without options is deprecated and will be removed at v4.0`,
    options !== undefined,
    {
      id: 'ember-modifier.function-based-options',
      for: 'ember-modifier',
      since: {
        available: '3.2.0',
        enabled: '3.2.0',
      },
      until: '4.0.0',
    }
  );

  deprecate(
    `ember-modifier (for ${fn.name ?? fn} at ${
      new Error().stack
    }): creating a function-based modifier with \`{ eager: true }\` is deprecated and will be removed at v4.0`,
    options?.eager === false,
    {
      id: 'ember-modifier.function-based-options',
      for: 'ember-modifier',
      since: {
        available: '3.2.0',
        enabled: '3.2.0',
      },
      until: '4.0.0',
    }
  );

  // SAFETY: the cast here is a *lie*, but it is a useful one. The actual return
  // type of `setModifierManager` today is `void`; we pretend it actually
  // returns an opaque `Modifier` type so that we can provide a result from this
  // type which is useful to TS-aware tooling (e.g. Glint).
  return setModifierManager(
    () => (options.eager ? EAGER_MANAGER : LAZY_MANAGER),
    fn
  ) as unknown as FunctionBasedModifier<{
    Element: Element;
    Args: {
      Named: object;
      Positional: unknown[];
    };
  }>;
}

/**
 * @internal
 */
export type FunctionalModifierDefinition<
  S,
  E extends ElementFor<S> = ElementFor<S>,
  P extends PositionalArgs<S> = PositionalArgs<S>,
  N extends NamedArgs<S> = NamedArgs<S>
> = (element: E, positional: P, named: N) => void | Teardown;

/**
 * @deprecated Instead of defining a function to match this type, simply define
 *   a function-based modifier either using a `Signature` or by defining the
 *   types on the callback passed to the `modifier`.
 */
export type FunctionalModifier<
  P extends ModifierArgs['positional'] = ModifierArgs['positional'],
  N extends ModifierArgs['named'] = ModifierArgs['named'],
  E extends Element = Element
> = (element: E, positional: P, named: N) => unknown;
