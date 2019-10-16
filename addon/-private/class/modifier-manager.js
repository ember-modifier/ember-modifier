import Ember from 'ember';
import { capabilities } from '@ember/modifier';
import { set } from '@ember/object';
import { schedule } from '@ember/runloop';

import { DESTROYING, DESTROYED } from './modifier';

class ClassBasedModifierManager {
  capabilities = capabilities('3.13');

  createModifier(factory, args) {
    let { owner, class: modifier } = factory;

    return new modifier(owner, args);
  }
  installModifier(instance, element) {
    instance.element = element;
    instance.didReceiveArguments();
    instance.didInstall();
  }

  updateModifier(instance, args) {
    // TODO: this should be an args proxy
    set(instance, 'args', args);
    instance.didUpdateArguments();
    instance.didReceiveArguments();
  }

  destroyModifier(instance) {
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

function scheduleDestroy(modifier, meta) {
  if (modifier[DESTROYED]) {
    return;
  }

  Ember.destroy(modifier);

  meta.setSourceDestroyed();
  modifier[DESTROYED] = true;
}

export default new ClassBasedModifierManager();
