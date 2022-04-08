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
import Opaque from '../opaque';

// SAFETY: these sets are dev-only code to avoid showing deprecations for the
// same class more than once.
type ClassBasedModifierClass = ClassBasedModifier['constructor'];
let SEEN_CLASSES_FOR_LIFECYCLE: Set<ClassBasedModifierClass>;
if (DEBUG) {
  SEEN_CLASSES_FOR_LIFECYCLE = new Set();
}

let SEEN_CLASSES_FOR_DESTROYABLES: Set<ClassBasedModifierClass>;
if (DEBUG) {
  SEEN_CLASSES_FOR_DESTROYABLES = new Set();
}

let SEEN_CLASSES_FOR_ARGS: Set<ClassBasedModifierClass>;
if (DEBUG) {
  SEEN_CLASSES_FOR_ARGS = new Set();
}

let SEEN_CLASSES_FOR_ELEMENTS: Set<ClassBasedModifierClass>;
if (DEBUG) {
  SEEN_CLASSES_FOR_ELEMENTS = new Set();
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

/** @internal */
export const Element = Symbol('Element');

/** @internal */
export const Args = Symbol('Args');

// Preserve the signature on a class-based modifier so it can be plucked off
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
export default class ClassBasedModifier<S = DefaultSignature> {
  // Done this way with the weird combination of `declare` and `defineProperty`
  // so that subclasses which are overriding this by writing their own `args`
  // field type declarations continue to type check correctly. (If we introduced
  // a getter here, existing classes defining their args via a `declare args:`
  // would stop type checking, because TS -- correctly! -- differentiates
  // between class fields and getters).
  /**
   * The arguments passed to the modifier. `args.positional` is an array of
   * positional arguments, and `args.named` is an object containing the named
   * arguments.
   *
   * @deprecated Until 4.0. Access positional and named arguments directly in
   *   the `modify` hook instead.
   */
  declare readonly args: ArgsFor<S>;

  // Done this way with the weird combination of `declare` and `defineProperty`
  // so that subclasses which are overriding this by writing their own `element`
  // field declarations continue to type check correctly.
  /**
   * The element the modifier is applied to.
   *
   * @warning `element` is ***not*** available during `constructor` or
   *   `willDestroy`.
   * @deprecated Until 4.0. Access the `element` as an argument in the `modify`
   *   hook instead.
   */
  declare element: ElementFor<S>;

  constructor(owner: unknown, args: ArgsFor<S>) {
    setOwner(this, owner);

    // SAFETY: the point here is (for the period where we are providing `args`
    // and `element`) to provide an internal-only way of setting and update the
    // `args` for the modifier instance; we use the `InternalClassBasedModifier`
    // interface to represent the internal-only API in a way that end users do
    // *not* have access to when subclassing `ClassBasedModifier`.
    (this as unknown as InternalClassBasedModifier<S>)[Args] = args;

    assert(
      'ember-modifier: You cannot implement both `modify` and any of the deprecated legacy lifecycle hooks (`didInstall`, `didReceiveArguments`, and `didUpdateArguments`)',
      !(_implementsModify(this) && _implementsLegacyHooks(this))
    );

    deprecate(
      `ember-modifier (in ${this.constructor.name} at ${
        new Error().stack
      }): \`willDestroy\`, \`isDestroyed\`, and \`isDestroyed\` are deprecated. Use the corresponding API from '@ember/destroyable' instead.`,
      this.willDestroy === ClassBasedModifier.prototype.willDestroy ||
        SEEN_CLASSES_FOR_DESTROYABLES.has(this.constructor),
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
      _implementsModify(this) ||
        SEEN_CLASSES_FOR_LIFECYCLE.has(this.constructor),
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
      SEEN_CLASSES_FOR_DESTROYABLES.has(this.constructor),
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
      SEEN_CLASSES_FOR_DESTROYABLES.has(this.constructor),
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

// We apply these here, against the prototype, so that there is only one of
// these, rather than one per instance. We also only issue the deprecation once
// per class for each of `args` and `element`.
Object.defineProperty(ClassBasedModifier.prototype, 'args', {
  enumerable: true,
  get(this: InternalClassBasedModifier<unknown>) {
    deprecate(
      `ember-modifier (in ${this.constructor.name} at ${
        new Error().stack
      }): using \`this.args\` is deprecated. Access positional and named arguments directly in the \`modify\` hook instead.`,
      SEEN_CLASSES_FOR_ARGS.has(this.constructor),
      {
        id: 'ember-modifier.no-args-property',
        for: 'ember-modifier',
        since: {
          available: '3.2.0',
          enabled: '3.2.0',
        },
        until: '4.0.0',
      }
    );

    if (DEBUG && !SEEN_CLASSES_FOR_ARGS.has(this.constructor)) {
      SEEN_CLASSES_FOR_ARGS.add(this.constructor);
    }

    return this[Args];
  },
});

Object.defineProperty(ClassBasedModifier.prototype, 'element', {
  enumerable: true,
  get(this: InternalClassBasedModifier<unknown>) {
    deprecate(
      `ember-modifier (in ${this.constructor.name} at ${
        new Error().stack
      }): using \`this.element\` is deprecated. Access the \`element\` as an argument in the \`modify\` hook instead.`,
      SEEN_CLASSES_FOR_ELEMENTS.has(this.constructor),
      {
        id: 'ember-modifier.no-element-property',
        for: 'ember-modifier',
        since: {
          available: '3.2.0',
          enabled: '3.2.0',
        },
        until: '4.0.0',
      }
    );

    if (DEBUG && !SEEN_CLASSES_FOR_ELEMENTS.has(this.constructor)) {
      SEEN_CLASSES_FOR_ELEMENTS.add(this.constructor);
    }

    return this[Element] ?? null;
  },
});

/**
 * @internal This provides an interface we can use to backwards-compatibly set
 *   up the element in a way that external callers will not have access to or
 *   even see.
 */
export interface InternalClassBasedModifier<S> extends ClassBasedModifier<S> {
  [Element]: ElementFor<S>;
  [Args]: ArgsFor<S>;
}

setModifierManager((owner) => new Manager(owner), ClassBasedModifier);
