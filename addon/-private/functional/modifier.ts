import { setModifierManager } from '@ember/modifier';
import {
  DefaultSignature,
  ElementFor,
  ModifierArgs,
  NamedArgs,
  PositionalArgs,
} from '../signature';
import FunctionalModifierManager from './modifier-manager';

// Type-only utilities used for representing the type of a Modifier in a way
// that (a) has no runtime overhead and (b) makes no public API commitment: by
// extending it with an interface representing the modifier, its internals
// become literally invisible. The private field for the "brand" is not visible
// when interacting with an interface which extends this, but it makes the type
// non-substitutable with an empty object. This is borrowed from, and basically
// identical to, the same time used internally in Ember's types.
declare const Brand: unique symbol;
declare class Opaque<T> {
  private readonly [Brand]: T;
}

// This provides a signature whose only purpose here is to represent the runtime
// type of a function-based modifier: an opaque item. The fact that it's an
// empty interface is actually the point: it makes the private `[Brand]` above
// is not visible to end users.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FunctionBasedModifier<S = DefaultSignature>
  extends Opaque<S> {}

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
 * that it accesses will be tracked, including the arguments it receives, and if
 * any of them changes, the function will run again.
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
export default function modifier<
  E extends Element,
  P extends unknown[],
  N extends object
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
 * that it accesses will be tracked, including the arguments it receives, and if
 * any of them changes, the function will run again.
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
export default function modifier<
  E extends Element,
  P extends unknown[],
  N extends object
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
 * that it accesses will be tracked, including the arguments it receives, and if
 * any of them changes, the function will run again.
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
export default function modifier<
  E extends Element,
  P extends unknown[],
  N extends object
>(
  fn: (element: E, positional: P, named: N) => void | Teardown,
  options: { eager: false }
): FunctionBasedModifier<{
  Args: { Named: N; Positional: P };
  Element: E;
}>;

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
  options?: { eager: boolean }
): FunctionBasedModifier<{
  Element: Element;
  Args: {
    Named: object;
    Positional: unknown[];
  };
}> {
  // SAFETY: the cast here is a *lie*, but it is a useful one. The actual return
  // type of `setModifierManager` today is `void`; we pretend it actually
  // returns an opaque `Modifier` type so that we can provide a result from this
  // type which is useful to TS-aware tooling (e.g. Glint).
  return setModifierManager(
    () => new FunctionalModifierManager(options),
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
