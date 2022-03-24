import { setOwner } from '@ember/application';
import { setModifierManager } from '@ember/modifier';
import Manager from './modifier-manager';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import {
  ElementFor,
  ArgsFor,
  DefaultSignature,
  PositionalArgs,
  NamedArgs,
} from '../signature';
import { assert, deprecate } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

// SAFETY: these sets are dev-only code to avoid showing deprecations for the
// same class more than once.
let SEEN_CLASSES_FOR_LIFECYCLE: Set<ClassBasedModifier['constructor']>;
if (DEBUG) {
  SEEN_CLASSES_FOR_LIFECYCLE = new Set();
}

let SEEN_CLASSES_FOR_DESTROYABLES: Set<ClassBasedModifier['constructor']>;
if (DEBUG) {
  SEEN_CLASSES_FOR_DESTROYABLES = new Set();
}

/** @internal */
export const _implementsModify = <S>(
  instance: ClassBasedModifier<S>
): boolean => instance.modify !== ClassBasedModifier.prototype.modify;

/** @internal */
export const _implementsLegacyHooks = <S>(
  instance: ClassBasedModifier<S>
): boolean =>
  instance.didInstall !== ClassBasedModifier.prototype.didInstall ||
  instance.didUpdateArguments !==
    ClassBasedModifier.prototype.didUpdateArguments ||
  instance.didReceiveArguments !==
    ClassBasedModifier.prototype.didReceiveArguments;

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
   */
  readonly args: ArgsFor<S>;

  /**
   * The element the modifier is applied to.
   *
   * @warning `element` is ***not*** available during `constructor` or
   *   `willDestroy`.
   */
  // SAFETY: this is managed correctly by the class-based modifier. It is not
  // available during the `constructor`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: ElementFor<S> = null as any;

  constructor(owner: unknown, args: ArgsFor<S>) {
    setOwner(this, owner);
    this.args = args;

    assert(
      'ember-modifier: You cannot implement both `modify` and any of the deprecated legacy lifecycle hooks (`didInstall`, `didReceiveArguments`, and `didUpdateArguments`)',
      !(_implementsModify(this) && _implementsLegacyHooks(this))
    );

    deprecate(
      `ember-modifier (in ${this.constructor.name} at ${
        new Error().stack
      }): \`willDestroy\`, \`isDestroyed\`, and \`isDestroyed\` are deprecated. Use the corresponding API from '@ember/destroyable' instead.`,
      (['willDestroy', 'isDestroying', 'isDestroyed'] as const).some(
        (name) => this[name] !== ClassBasedModifier.prototype[name]
      ) && !SEEN_CLASSES_FOR_DESTROYABLES.has(this.constructor),
      {
        id: 'ember-modifier.use-destroyables',
        until: '4.0.0',
        for: 'ember-modifier',
        since: {
          available: '3.2.0',
          enabled: '3.2.0',
        },
      }
    );

    if (DEBUG && !SEEN_CLASSES_FOR_DESTROYABLES.has(this.constructor)) {
      SEEN_CLASSES_FOR_DESTROYABLES.add(this.constructor);
    }

    deprecate(
      `ember-modifier (in ${this.constructor.name} at ${
        new Error().stack
      }): The \`didInstall\`, \`didReceiveArguments\`, and \`didUpdateArguments\` hooks are deprecated. Use the new \`modify\` hook instead.`,
      !_implementsModify(this) &&
        !SEEN_CLASSES_FOR_LIFECYCLE.has(this.constructor),
      {
        id: 'ember-modifier.use-modify',
        until: '4.0.0',
        for: 'ember-modifier',
        since: {
          available: '3.2.0',
          enabled: '3.2.0',
        },
      }
    );

    if (DEBUG && !SEEN_CLASSES_FOR_LIFECYCLE.has(this.constructor)) {
      SEEN_CLASSES_FOR_LIFECYCLE.add(this.constructor);
    }
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
    named: NamedArgs<S>
    /* eslint-enable @typescript-eslint/no-unused-vars */
  ): void {
    /* no op, for subclassing */
  }

  /**
   * Called when the modifier is installed **and** anytime the arguments are
   * updated.
   *
   * @deprecated Until 4.0. Use `modify()`.
   */
  didReceiveArguments(): void {
    /* no op, for subclassing */
  }

  /**
   * Called anytime the arguments are updated but **not** on the initial
   * install. Called before `didReceiveArguments`.
   *
   * @deprecated Until 4.0. Use `modify()`.
   */
  didUpdateArguments(): void {
    /* no op, for subclassing */
  }

  /**
   * Called when the modifier is installed on the DOM element. Called after
   * `didReceiveArguments`.
   *
   * @deprecated Until 4.0. Use `modify()`.
   */
  didInstall(): void {
    /* no op, for subclassing */
  }

  /**
   * Called when the DOM element is about to be destroyed; use for removing
   * event listeners on the element and other similar clean-up tasks.
   *
   * @deprecated since 2.0.0: prefer to use `willDestroy`, since both it and
   *   `willRemove` can perform all the same operations, including on the
   *   `element`.
   */
  willRemove(): void {
    /* no op, for subclassing */
  }

  /**
   * Called when the modifier itself is about to be destroyed; use for teardown
   * code. Called after `willRemove`.
   *
   * @deprecated Until 4.0. Use `registerDestructor` from `@ember/destroyables`.
   */
  willDestroy(): void {
    /* no op, for subclassing */
  }

  /**
   * @deprecated Until 4.0. Use `isDestroying` from `@ember/destroyables`.
   */
  get isDestroying(): boolean {
    deprecate(
      'Modifier.isDestroying is deprecated',
      !SEEN_CLASSES_FOR_DESTROYABLES.has(this.constructor),
      {
        id: 'ember-modifier.use-destroyables',
        until: '4.0.0',
        for: 'ember-modifier',
        since: {
          available: '3.2.0',
          enabled: '3.2.0',
        },
      }
    );

    if (DEBUG && !SEEN_CLASSES_FOR_DESTROYABLES.has(this.constructor)) {
      SEEN_CLASSES_FOR_DESTROYABLES.add(this.constructor);
    }

    return isDestroying(this);
  }

  /**
   * @deprecated Until 4.0. Use `isDestroyed` from `@ember/destroyables`.
   */
  get isDestroyed(): boolean {
    deprecate(
      'Modifier.isDestroyed is deprecated',
      !SEEN_CLASSES_FOR_DESTROYABLES.has(this.constructor),
      {
        id: 'ember-modifier.use-destroyables',
        until: '4.0.0',
        for: 'ember-modifier',
        since: {
          available: '3.2.0',
          enabled: '3.2.0',
        },
      }
    );

    if (DEBUG && !SEEN_CLASSES_FOR_DESTROYABLES.has(this.constructor)) {
      SEEN_CLASSES_FOR_DESTROYABLES.add(this.constructor);
    }

    return isDestroyed(this);
  }
}

setModifierManager((owner) => new Manager(owner), ClassBasedModifier);
