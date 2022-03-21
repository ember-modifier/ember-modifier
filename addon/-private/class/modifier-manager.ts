import { capabilities } from '@ember/modifier';
import { gte } from 'ember-compatibility-helpers';
import { set } from '@ember/object';
import { destroy, registerDestructor } from '@ember/destroyable';

import ClassBasedModifier from './modifier';
import { ArgsFor, ElementFor } from 'ember-modifier/-private/signature';
import { consumeArgs, Factory, isFactory } from '../compat';

function destroyModifier<S>(modifier: ClassBasedModifier<S>): void {
  modifier.willDestroy();
}

export default class ClassBasedModifierManager<S> {
  capabilities = capabilities(gte('3.22.0') ? '3.22' : '3.13');

  constructor(private owner: unknown) {}

  createModifier(
    factoryOrClass:
      | Factory<typeof ClassBasedModifier>
      | typeof ClassBasedModifier,
    args: ArgsFor<S>
  ): ClassBasedModifier<S> {
    const Modifier = isFactory(factoryOrClass)
      ? factoryOrClass.class
      : factoryOrClass;

    const modifier = new Modifier(this.owner, args);

    registerDestructor(modifier, destroyModifier);

    return modifier;
  }

  installModifier(
    instance: ClassBasedModifier<S>,
    element: ElementFor<S>,
    args: ArgsFor<S>
  ): void {
    instance.element = element;

    if (gte('3.22.0')) {
      consumeArgs(args);
    }

    instance.didReceiveArguments();
    instance.didInstall();
  }

  updateModifier(instance: ClassBasedModifier<S>, args: ArgsFor<S>): void {
    // TODO: this should be an args proxy
    set(instance, 'args', args);

    if (gte('3.22.0')) {
      consumeArgs(args);
    }

    instance.didUpdateArguments();
    instance.didReceiveArguments();
  }

  destroyModifier(instance: ClassBasedModifier): void {
    destroy(instance);
  }
}
