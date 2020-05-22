import Ember from 'ember';
import { capabilities } from '@ember/modifier';
import { set } from '@ember/object';
import { schedule } from '@ember/runloop';

import ClassBasedModifier, {
  DESTROYING,
  DESTROYED,
  InTeardown,
} from './modifier';
import { ModifierArgs } from 'ember-modifier/-private/interfaces';

function scheduleDestroy(modifier: ClassBasedModifier, meta: Ember.Meta): void {
  if (modifier[DESTROYED]) {
    return;
  }

  Ember.destroy(modifier);

  meta.setSourceDestroyed();
  modifier[DESTROYED] = true;
}

class ClassBasedModifierManager {
  capabilities = capabilities('3.13');

  createModifier(
    factory: { owner: unknown; class: typeof ClassBasedModifier },
    args: ModifierArgs
  ): ClassBasedModifier {
    // TODO: stop getting the owner off the factory like this; it is *not* per
    // the spec. See https://github.com/ember-modifier/ember-modifier/issues/25
    const { owner, class: modifier } = factory;

    return new modifier(owner, args);
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

  // Uses `InTeardown<ClassBasedModifier>` to correctly model the type of
  // `element` at this point in the lifecycle. This is safe because this manager
  // is what *defines* that lifecycle behavior.
  destroyModifier(instance: InTeardown<ClassBasedModifier>): void {
    instance.willRemove();
    instance.element = null;

    if (instance[DESTROYING]) {
      return;
    }

    const meta = Ember.meta(instance);

    meta.setSourceDestroying();
    instance[DESTROYING] = true;

    schedule('actions', instance, instance.willDestroy);
    schedule('destroy', undefined, scheduleDestroy, instance, meta);
  }
}

export default new ClassBasedModifierManager();
