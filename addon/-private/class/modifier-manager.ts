import { capabilities } from '@ember/modifier';
import { gte } from 'ember-compatibility-helpers';
import { set } from '@ember/object';
import {
  destroy,
  registerDestructor,
  associateDestroyableChild,
} from '@ember/destroyable';

import ClassBasedModifier, { _implementsModify } from './modifier';
import { ArgsFor, ElementFor } from 'ember-modifier/-private/signature';
import { consumeArgs, Factory, isFactory } from '../compat';

function destroyModifier<S>(modifier: ClassBasedModifier<S>): void {
  modifier.willDestroy();
}

/**
 * The state bucket used throughout the life-cycle of the modifier. Basically a
 * state *machine*, where the framework calls us with the version we hand back
 * to it at each phase. The two states are the two `extends` versions of this
 * below.
 * @internal
 */
interface State<S> {
  instance: ClassBasedModifier<S>;
  element: ElementFor<S> | null;
}

/**
 * The `State` after calling `createModifier`, and therefore the state available
 * at the start of `InstallModifier`.
 * @internal
 */
interface CreateState<S> extends State<S> {
  element: null;
}

/**
 * The `State` after calling `installModifier`, and therefore the state
 * available in all subsequent `updateModifier` calls.
 * @internal
 */
interface InstalledState<S> extends State<S> {
  element: ElementFor<S>;
}

export default class ClassBasedModifierManager<S> {
  capabilities = capabilities(gte('3.22.0') ? '3.22' : '3.13');

  constructor(private owner: unknown) {}

  createModifier(
    factoryOrClass:
      | Factory<typeof ClassBasedModifier>
      | typeof ClassBasedModifier,
    args: ArgsFor<S>
  ): CreateState<S> {
    const Modifier = isFactory(factoryOrClass)
      ? factoryOrClass.class
      : factoryOrClass;

    const modifier = new Modifier(this.owner, args);

    const state: CreateState<S> = {
      instance: modifier,
      element: null,
    };

    // Since we have created a state bucket to hand around, we need to make its
    // destruction trigger the destruction of the modifier. (Ember will
    // automatically call `destroy` on the state bucket returned from the
    // `createModifier` hook for precisely this reason.)
    associateDestroyableChild(state, modifier);
    registerDestructor(modifier, destroyModifier);

    return state;
  }

  installModifier(
    state: State<S>,
    element: ElementFor<S>,
    args: ArgsFor<S>
  ): void {
    const { instance } = state;
    instance.element = element;
    state.element = element;

    // The `consumeArgs()` call backwards compatibility on v3 for the deprecated
    // legacy lifecycle hooks (`didInstall`, `didReceiveArguments`, and
    // `didUpdateArguments`), which accidentally had eager consumption semantics
    // prior to Ember 3.22. The new, recommended `modify` hook has the updated
    // lazy semantics associated with normal auto-tracking.
    const implementsModify = _implementsModify(instance);
    if (gte('3.22.0') && !implementsModify) {
      consumeArgs(args);
    }

    if (implementsModify) {
      instance.modify(element, args.positional, args.named);
    } else {
      instance.didReceiveArguments();
      instance.didInstall();
    }
  }

  updateModifier(state: InstalledState<S>, args: ArgsFor<S>): void {
    const { instance } = state;

    set(instance, 'args', args); // TODO: remove aat 4.0

    // The `consumeArgs()` call backwards compatibility on v3 for the deprecated
    // legacy lifecycle hooks (`didInstall`, `didReceiveArguments`, and
    // `didUpdateArguments`), which accidentally had eager consumption semantics
    // prior to Ember 3.22. The new, recommended `modify` hook has the updated
    // lazy semantics associated with normal auto-tracking.
    const implementsModify = _implementsModify(instance);
    if (gte('3.22.0') && !implementsModify) {
      consumeArgs(args);
    }

    if (implementsModify) {
      instance.modify(state.element, args.positional, args.named);
    } else {
      instance.didUpdateArguments();
      instance.didReceiveArguments();
    }
  }

  destroyModifier(instance: ClassBasedModifier): void {
    destroy(instance);
  }
}
