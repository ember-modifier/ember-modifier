import { setOwner } from "@ember/application";
import { setModifierManager } from "@ember/modifier";
import Manager from "./modifier-manager";
import { symbol } from "../utils/symbol";
import { ModifierArgs } from "ember-modifier/-private/interfaces";

export const DESTROYING: unique symbol = symbol("destroying");
export const DESTROYED: unique symbol = symbol("destroyed");

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
export default class ClassBasedModifier<
  Args extends ModifierArgs = ModifierArgs
> {
  // NOTE: these are private (and `DESTROYING` and `DESTROYED` are not exported
  // in the main export, only at `-private` locations), but these cannot be made
  // `private` in the class body because the modifier manager needs to be able
  // to access them
  [DESTROYING] = false;
  [DESTROYED] = false;

  /**
   * The arguments passed to the modifier. `args.positional` is an array of
   * positional arguments, and `args.named` is an object containing the named
   * arguments.
   */
  readonly args: Args;

  /**
   * The element the modifier is applied to.
   *
   * @warning `element` is ***not*** available during `constructor` or
   *   `willDestroy`.
   */
  // SAFETY: this is managed correctly by the class-based modifier.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: Element = null as any;

  constructor(owner: unknown, args: Args) {
    setOwner(this, owner);
    this.args = args;
  }

  /**
   * Called when the modifier is installed **and** anytime the arguments are
   * updated.
   */
  didReceiveArguments(): void {
    /* no op, for subclassing */
  }

  /**
   * Called anytime the arguments are updated but **not** on the initial
   * install. Called before `didReceiveArguments`.
   */
  didUpdateArguments(): void {
    /* no op, for subclassing */
  }

  /**
   * Called when the modifier is installed on the DOM element. Called after
   * `didReceiveArguments`.
   */
  didInstall(): void {
    /* no op, for subclassing */
  }

  /**
   * Called when the DOM element is about to be destroyed; use for removing
   * event listeners on the element and other similar clean-up tasks.
   */
  willRemove(): void {
    /* no op, for subclassing */
  }

  /**
   * Called when the modifier itself is about to be destroyed; use for teardown
   * code. Called after `willRemove`. The element is no longer available at this
   * point (i.e. its value is `null` during teardown).
   *
   * @note TypeScript users can import the `InTeardown` type utility for safely
   *   handling `null` here; see [the note in the README for details][README].
   *
   * [README]: https://github.com/ember-modifier/ember-modifier#lifecycle-hooks-and-types
   */
  willDestroy(): void {
    /* no op, for subclassing */
  }

  get isDestroying(): boolean {
    return this[DESTROYING];
  }

  get isDestroyed(): boolean {
    return this[DESTROYED];
  }
}

/**
 * A utility for extra type safety in the `willDestroy` lifecycle hook in
 * classes which extend `ClassBasedModifier`: it types `element` as `null`.
 *
 * ## Usage
 *
 * ```ts
 * import Modifier, { InTeardown } from 'ember-modifier';
 *
 * function doSomethingWithElement(el: Element) {
 *   // ...
 * }
 *
 * export default class CorrectlyTypedModifier extends Modifier {
 *   willRemove(this: InTeardown<CorrectlyTypedModifier>) {
 *     doSomethingWithElement(this.element); // TYPE ERROR!
 *   }
 * }
 * ```
 */
export type InTeardown<M extends ClassBasedModifier> = Omit<M, "element"> & {
  element: null;
};

setModifierManager(() => Manager, ClassBasedModifier);
