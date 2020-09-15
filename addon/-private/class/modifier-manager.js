import Ember from 'ember';
import { capabilities } from '@ember/modifier';
import { set } from '@ember/object';
import { schedule } from '@ember/runloop';
import { gte } from 'ember-compatibility-helpers';

import { DESTROYING, DESTROYED } from './modifier';

class ClassBasedModifierManager {
  capabilities = capabilities('3.13');

  constructor(owner) {
    this.owner = owner;
  }

  createModifier(factory, args) {
    let Modifier = factory.class;

    return new Modifier(this.owner, args);
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

    instance[DESTROYING] = true;

    if (gte('3.20.0-beta.4')) {
      // call this on 3.20+ early because it is using the
      // @ember/destroyable API's `destroy` function (this will
      // ensure that any users _on_ 3.20 that have called
      // `registerDestructor` have their destructors called
      // eslint-disable-next-line ember/new-module-imports
      Ember.destroy(instance);
    } else {
      meta.setSourceDestroying();
    }

    schedule('actions', instance, instance.willDestroy);
    schedule('destroy', undefined, scheduleDestroy, instance, meta);
  }
}

function scheduleDestroy(modifier, meta) {
  if (modifier[DESTROYED]) {
    return;
  }

  if (!gte('3.20.0-beta.4')) {
    // in 3.20+ we call destroy _early_ (because it is actually
    // the @ember/destroyable's `destroy` API)
    // eslint-disable-next-line ember/new-module-imports
    Ember.destroy(modifier);
    meta.setSourceDestroyed();
  }

  modifier[DESTROYED] = true;
}

export default ClassBasedModifierManager;
