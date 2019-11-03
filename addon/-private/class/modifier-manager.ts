import Ember, {Meta} from 'ember';
import { capabilities } from '@ember/modifier';
import { set } from '@ember/object';
import { schedule } from '@ember/runloop';

import { ModifierArgs, ModifierFactory } from 'ember-modifier/types';

import ClassBasedModifier, { DESTROYING, DESTROYED } from './modifier';

class ClassBasedModifierManager {
  capabilities = capabilities('3.13');

  createModifier<Args extends ModifierArgs>(factory: ModifierFactory<typeof ClassBasedModifier>, args: Args) {
    let { owner, class: modifier } = factory;

    return new modifier(owner, args);
  }
  installModifier<Args extends ModifierArgs>(instance: ClassBasedModifier<Args>, element: HTMLElement) {
    instance.element = element;
    instance.didReceiveArguments();
    instance.didInstall();
  }

  updateModifier<Args extends ModifierArgs>(instance: ClassBasedModifier<Args>, args: Args) {
    // TODO: this should be an args proxy
    set(instance, 'args', args);
    instance.didUpdateArguments();
    instance.didReceiveArguments();
  }

  destroyModifier<Args extends ModifierArgs>(instance: ClassBasedModifier<Args>) {
    instance.willRemove();
    instance.element = null;

    if (instance[DESTROYING]) {
      return;
    }

    let meta = Ember.meta(instance);

    meta.setSourceDestroying();
    instance[DESTROYING] = true;

    schedule('actions', instance, instance.willDestroy);
    schedule('destroy', undefined, scheduleDestroy, instance, meta);
  }
}

function scheduleDestroy<Args extends ModifierArgs>(modifier: ClassBasedModifier<Args>, meta: Meta) {
  if (modifier[DESTROYED]) {
    return;
  }

  Ember.destroy(modifier);

  meta.setSourceDestroyed();
  modifier[DESTROYED] = true;
}

export default new ClassBasedModifierManager();
