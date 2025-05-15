import type { ElementFor, EmptyObject, NamedArgs, PositionalArgs } from '../signature';
import type Modifier from '../class-based/modifier';
export declare abstract class FunctionBasedModifierInstance<S> extends Modifier<S> {
    protected abstract __concrete__: never;
}
export type FunctionBasedModifier<S> = abstract new () => FunctionBasedModifierInstance<S>;
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
export default function modifier<E extends Element, P extends unknown[], N = EmptyObject>(fn: (element: E, positional: P, named: N) => void | Teardown): FunctionBasedModifier<{
    Args: {
        Positional: P;
        Named: N;
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
 */
export default function modifier<S>(fn: (element: ElementFor<S>, positional: PositionalArgs<S>, named: NamedArgs<S>) => void | Teardown): FunctionBasedModifier<{
    Element: ElementFor<S>;
    Args: {
        Named: NamedArgs<S>;
        Positional: PositionalArgs<S>;
    };
}>;
/**
 * @internal
 */
export type FunctionBasedModifierDefinition<S> = (element: ElementFor<S>, positional: PositionalArgs<S>, named: NamedArgs<S>) => void | Teardown;
//# sourceMappingURL=modifier.d.ts.map