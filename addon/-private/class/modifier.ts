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

function deprecateForDestroyables<S>(
  name: 'willDestroy' | 'isDestroying' | 'isDestroyed',
  instance: ClassBasedModifier<S>
): void {
  deprecate(
    `Modifier.${name} is deprecated. Use the corresponding API from '@ember/destroyable' instead.`,
    instance[name] !== ClassBasedModifier.prototype[name],
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
}

function deprecateForLifecycle<S>(
  name: 'didInstall' | 'didReceiveArguments' | 'didUpdateArguments',
  instance: ClassBasedModifier<S>
): void {
  deprecate(
    `Modifier.${name} is deprecated. Use the new \`modify\` hook instead.`,
    instance[name] !== ClassBasedModifier.prototype[name],
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

    deprecateForDestroyables('willDestroy', this);
    deprecateForDestroyables('isDestroying', this);
    deprecateForDestroyables('isDestroyed', this);
    deprecateForLifecycle('didInstall', this);
    deprecateForLifecycle('didReceiveArguments', this);
    deprecateForLifecycle('didUpdateArguments', this);

    assert(
      'ember-modifier: You cannot implement both `modify` and any of the deprecated legacy lifecycle hooks (`didInstall`, `didReceiveArguments`, and `didUpdateArguments`)',
      !(_implementsModify(this) && _implementsLegacyHooks(this))
    );
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
    deprecate('Modifier.isDestroying is deprecated', false, {
      id: 'ember-modifier.use-destroyables',
      until: '4.0.0',
      for: 'ember-modifier',
      since: {
        available: '3.2.0',
        enabled: '3.2.0',
      },
    });

    return isDestroying(this);
  }

  /**
   * @deprecated Until 4.0. Use `isDestroyed` from `@ember/destroyables`.
   */
  get isDestroyed(): boolean {
    deprecate('Modifier.isDestroyed is deprecated', false, {
      id: 'ember-modifier.use-destroyables',
      until: '4.0.0',
      for: 'ember-modifier',
      since: {
        available: '3.2.0',
        enabled: '3.2.0',
      },
    });

    return isDestroyed(this);
  }
}

setModifierManager((owner) => new Manager(owner), ClassBasedModifier);
