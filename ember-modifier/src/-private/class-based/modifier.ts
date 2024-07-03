import { setOwner } from '@ember/application';
import { setModifierManager } from '@ember/modifier';
import type Owner from '@ember/owner';
import Manager from './modifier-manager.ts';
import type {
  ElementFor,
  ArgsFor,
  DefaultSignature,
  PositionalArgs,
  NamedArgs,
} from '../signature';
import type Opaque from '../opaque';

// Preserve the signature on a class-based modifier, so it can be plucked off
// later (by e.g. Glint), using interface merging with an opaque item to
// preserve it in the type system. The fact that it's an empty interface is
// actually the point: it *only* hooks the type parameter into the opaque
// (nominal) type. Note that this is distinct from the function-based modifier
// type intentionally, because it is actually the static class side of a
// class-based modifier which corresponds to the result of calling `modifier()`
// with a callback defining a function-based modifier.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface ClassBasedModifier<S = DefaultSignature>
  extends Opaque<S> {}

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
export default class ClassBasedModifier<S = DefaultSignature> {
  // `args` is passed here for the sake of subclasses to have access to args in
  // their constructors while having constructors which are properly asssignable
  // for the superclass.
  /**
   *
   * @param owner An instance of an Owner (for service injection etc.).
   * @param args The positional and named arguments passed to the modifier.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(owner: Owner, args: ArgsFor<S>) {
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
  modify(
    /* eslint-disable @typescript-eslint/no-unused-vars */
    element: ElementFor<S>,
    positional: PositionalArgs<S>,
    named: NamedArgs<S>,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  ): void {
    /* no op, for subclassing */
  }
}

setModifierManager((owner) => new Manager(owner), ClassBasedModifier);
