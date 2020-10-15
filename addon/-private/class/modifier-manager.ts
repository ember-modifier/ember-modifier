import { capabilities } from '@ember/modifier';
import { gte } from 'ember-compatibility-helpers';
import { set } from '@ember/object';
import { destroy, registerDestructor } from '@ember/destroyable';
import { assert } from '@ember/debug';

import ClassBasedModifier from './modifier';
import { ModifierArgs } from 'ember-modifier/-private/interfaces';

function destroyModifier(modifier: ClassBasedModifier): void {
  modifier.willRemove();
  modifier.willDestroy();
}

type CreateModifierArgs313 = [
  { owner: unknown; class: typeof ClassBasedModifier },
  ModifierArgs
];
type CreateModifierArgs322 = [typeof ClassBasedModifier, ModifierArgs];
type CreateModifierArgs = CreateModifierArgs313 | CreateModifierArgs322;

export default class ClassBasedModifierManager {
  capabilities = capabilities(gte('3.22.0') ? '3.22' : '3.13');

  constructor(private owner: unknown) {}

  createModifier(
    ...createModifierArgs: CreateModifierArgs
  ): ClassBasedModifier {
    const [factoryOrClass, args] = createModifierArgs;

    let Modifier: typeof ClassBasedModifier;

    if (gte('3.22.0')) {
      assert(
        'expected factory to be a class reference',
        !('class' in factoryOrClass)
      );

      Modifier = factoryOrClass;
    } else {
      assert(
        'createModifier expected an object with keys owner and class',
        'class' in factoryOrClass
      );

      Modifier = factoryOrClass.class;
    }

    const modifier = new Modifier(this.owner, args);

    registerDestructor(modifier, destroyModifier);

    return modifier;
  }

  installModifier(instance: ClassBasedModifier, element: Element): void {
    instance.element = element;
    instance.didReceiveArguments();
    instance.didInstall();
  }

  updateModifier(instance: ClassBasedModifier, args: ModifierArgs): void {
    set(instance, 'args', args);
    instance.didUpdateArguments();
    instance.didReceiveArguments();
  }

  destroyModifier(instance: ClassBasedModifier): void {
    destroy(instance);
  }
}
