import Opaque from '../opaque';
import { DefaultSignature, ElementFor, ModifierArgs, NamedArgs, PositionalArgs } from '../signature';
export interface FunctionBasedModifier<S = DefaultSignature> extends Opaque<S> {
}
/**
 * The (optional) return type for a modifier which needs to perform some kind of
 * cleanup or teardown -- for example, removing an event listener from an
 * element besides the one passed into the modifier.
 */
export declare type Teardown = () => unknown;
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
export default function modifier<E extends Element, P extends unknown[], N extends object>(fn: (element: E, positional: P, named: N) => void | Teardown): FunctionBasedModifier<{
    Args: {
        Named: N;
        Positional: P;
    };
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
export default function modifier<E extends Element, P extends unknown[], N extends object>(fn: (element: E, positional: P, named: N) => void | Teardown, options: {
    eager: true;
}): FunctionBasedModifier<{
    Args: {
        Named: N;
        Positional: P;
    };
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
export default function modifier<E extends Element, P extends unknown[], N extends object>(fn: (element: E, positional: P, named: N) => void | Teardown, options: {
    eager: false;
}): FunctionBasedModifier<{
    Args: {
        Named: N;
        Positional: P;
    };
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
export default function modifier<S>(fn: (element: ElementFor<S>, positional: PositionalArgs<S>, named: NamedArgs<S>) => void | Teardown, options: {
    eager: false;
}): FunctionBasedModifier<{
    Element: ElementFor<S>;
    Args: {
        Named: NamedArgs<S>;
        Positional: PositionalArgs<S>;
    };
}>;
/**
 * @internal
 */
export declare type FunctionalModifierDefinition<S, E extends ElementFor<S> = ElementFor<S>, P extends PositionalArgs<S> = PositionalArgs<S>, N extends NamedArgs<S> = NamedArgs<S>> = (element: E, positional: P, named: N) => void | Teardown;
/**
 * @deprecated Instead of defining a function to match this type, simply define
 *   a function-based modifier either using a `Signature` or by defining the
 *   types on the callback passed to the `modifier`.
 */
export declare type FunctionalModifier<P extends ModifierArgs['positional'] = ModifierArgs['positional'], N extends ModifierArgs['named'] = ModifierArgs['named'], E extends Element = Element> = (element: E, positional: P, named: N) => unknown;
