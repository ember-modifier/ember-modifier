import { capabilities } from '@ember/modifier';
import { set } from '@ember/object';
import { destroy, registerDestructor } from '@ember/destroyable';

import ClassBasedModifier from './modifier';
import { ModifierArgs } from 'ember-modifier/-private/interfaces';

function destroyModifier(modifier: ClassBasedModifier): void {
  modifier.willRemove();
  modifier.willDestroy();
}

class ClassBasedModifierManager {
  capabilities = capabilities('3.13');

  createModifier(
    factory: { owner: unknown; class: typeof ClassBasedModifier },
    args: ModifierArgs
  ): ClassBasedModifier {
    // TODO: stop getting the owner off the factory like this; it is *not* per
    // the spec. See https://github.com/ember-modifier/ember-modifier/issues/25
    const { owner, class: Modifier } = factory;

    const modifier = new Modifier(owner, args);

    registerDestructor(modifier, destroyModifier);

    return modifier;
  }

  installModifier(instance: ClassBasedModifier, element: Element): void {
    instance.element = element;
    instance.didReceiveArguments();
    instance.didInstall();
  }

  updateModifier(instance: ClassBasedModifier, args: ModifierArgs): void {
    // TODO: this should be an args proxy
    set(instance, 'args', args);
    instance.didUpdateArguments();
    instance.didReceiveArguments();
  }

  destroyModifier(instance: ClassBasedModifier): void {
    destroy(instance);
  }
}

export default new ClassBasedModifierManager();
