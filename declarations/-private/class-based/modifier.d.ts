import type Owner from '@ember/owner';
import type { ElementFor, ArgsFor, DefaultSignature, PositionalArgs, NamedArgs } from '../signature';
import type Opaque from '../opaque';
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
     *
     * @param owner An instance of an Owner (for service injection etc.).
     * @param args The positional and named arguments passed to the modifier.
     */
    constructor(owner: Owner, args: ArgsFor<S>);
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
}
//# sourceMappingURL=modifier.d.ts.map