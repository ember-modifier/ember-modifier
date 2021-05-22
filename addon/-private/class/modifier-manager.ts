import { capabilities } from '@ember/modifier';
import { gte } from 'ember-compatibility-helpers';
import { set } from '@ember/object';
import { destroy, registerDestructor } from '@ember/destroyable';

import ClassBasedModifier from './modifier';
import { ModifierArgs } from 'ember-modifier/-private/interfaces';
import { consumeArgs } from '../consume-args';

interface Factory {
  owner: unknown;
  class: typeof ClassBasedModifier;
}

function destroyModifier(modifier: ClassBasedModifier): void {
  modifier.willRemove();
  modifier.willDestroy();
}

function isFactory(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _factoryOrClass: Factory | unknown
): _factoryOrClass is Factory {
  return !gte('3.22.0');
}

export default class ClassBasedModifierManager {
  capabilities = capabilities(gte('3.22.0') ? '3.22' : '3.13');

  constructor(private owner: unknown) {}

  createModifier(
    factoryOrClass: Factory | typeof ClassBasedModifier,
    args: ModifierArgs
  ): ClassBasedModifier {
    let Modifier: typeof ClassBasedModifier;

    if (isFactory(factoryOrClass)) {
      Modifier = factoryOrClass.class;
    } else {
      Modifier = factoryOrClass;
    }

    const modifier = new Modifier(this.owner, args);

    registerDestructor(modifier, destroyModifier);

    return modifier;
  }

  installModifier(
    instance: ClassBasedModifier,
    element: Element,
    args: ModifierArgs
  ): void {
    instance.element = element;

    if (gte('3.22.0')) {
      consumeArgs(args);
    }

    instance.didReceiveArguments();
    instance.didInstall();
  }

  updateModifier(instance: ClassBasedModifier, args: ModifierArgs): void {
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
