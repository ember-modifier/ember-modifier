import { ElementFor, ArgsFor, DefaultSignature, PositionalArgs, NamedArgs } from '../signature';
import Opaque from '../opaque';
/** @internal */
export declare const _implementsModify: <S>(instance: ClassBasedModifier<S>) => boolean;
/** @internal */
export declare const _implementsLegacyHooks: <S>(instance: ClassBasedModifier<S>) => boolean;
/** @internal */
export declare const Element: unique symbol;
/** @internal */
export declare const Args: unique symbol;
export default interface ClassBasedModifier<S = DefaultSignature> extends Opaque<S> {
}
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
export default class ClassBasedModifier<S = DefaultSignature> {
    /**
     * The arguments passed to the modifier. `args.positional` is an array of
     * positional arguments, and `args.named` is an object containing the named
     * arguments.
     *
     * @deprecated Until 4.0. Access positional and named arguments directly in
     *   the `modify` hook instead.
     */
    readonly args: ArgsFor<S>;
    /**
     * The element the modifier is applied to.
     *
     * @warning `element` is ***not*** available during `constructor` or
     *   `willDestroy`.
     * @deprecated Until 4.0. Access the `element` as an argument in the `modify`
     *   hook instead.
     */
    element: ElementFor<S>;
    constructor(owner: unknown, args: ArgsFor<S>);
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
    modify(element: ElementFor<S>, positional: PositionalArgs<S>, named: NamedArgs<S>): void;
    /**
     * Called when the modifier is installed **and** anytime the arguments are
     * updated.
     *
     * @deprecated Until 4.0. Use `modify()`.
     */
    didReceiveArguments(): void;
    /**
     * Called anytime the arguments are updated but **not** on the initial
     * install. Called before `didReceiveArguments`.
     *
     * @deprecated Until 4.0. Use `modify()`.
     */
    didUpdateArguments(): void;
    /**
     * Called when the modifier is installed on the DOM element. Called after
     * `didReceiveArguments`.
     *
     * @deprecated Until 4.0. Use `modify()`.
     */
    didInstall(): void;
    /**
     * Called when the DOM element is about to be destroyed; use for removing
     * event listeners on the element and other similar clean-up tasks.
     *
     * @deprecated since 2.0.0: prefer to use `willDestroy`, since both it and
     *   `willRemove` can perform all the same operations, including on the
     *   `element`.
     */
    willRemove(): void;
    /**
     * Called when the modifier itself is about to be destroyed; use for teardown
     * code. Called after `willRemove`.
     *
     * @deprecated Until 4.0. Use `registerDestructor` from `@ember/destroyables`.
     */
    willDestroy(): void;
    /**
     * @deprecated Until 4.0. Use `isDestroying` from `@ember/destroyables`.
     */
    get isDestroying(): boolean;
    /**
     * @deprecated Until 4.0. Use `isDestroyed` from `@ember/destroyables`.
     */
    get isDestroyed(): boolean;
}
/**
 * @internal This provides an interface we can use to backwards-compatibly set
 *   up the element in a way that external callers will not have access to or
 *   even see.
 */
export interface InternalClassBasedModifier<S> extends ClassBasedModifier<S> {
    [Element]: ElementFor<S>;
    [Args]: ArgsFor<S>;
}
