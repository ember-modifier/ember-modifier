import { capabilities } from '@ember/modifier';
import { gte } from 'ember-compatibility-helpers';
import { FunctionalModifier } from './modifier';
import { ModifierArgs } from '../interfaces';
import { consumeArgs } from '../consume-args';

interface Factory {
  class: FunctionalModifier;
}

const MODIFIER_ELEMENTS = new WeakMap();
const MODIFIER_TEARDOWNS: WeakMap<FunctionalModifier, unknown> = new WeakMap();

function teardown(modifier: FunctionalModifier): void {
  const teardown = MODIFIER_TEARDOWNS.get(modifier);

  if (teardown && typeof teardown === 'function') {
    teardown();
  }
}

function setup(
  modifier: FunctionalModifier,
  element: Element,
  args: ModifierArgs
): void {
  const { positional, named } = args;
  const teardown = modifier(element, positional, named);

  MODIFIER_TEARDOWNS.set(modifier, teardown);
}

function isFactory(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _factoryOrClass: Factory | unknown
): _factoryOrClass is Factory {
  return !gte('3.22.0');
}

class FunctionalModifierManager {
  capabilities = capabilities(gte('3.22.0') ? '3.22' : '3.13');

  createModifier(
    factoryOrClass: Factory | FunctionalModifier
  ): FunctionalModifier {
    let Modifier: FunctionalModifier;

    if (isFactory(factoryOrClass)) {
      Modifier = factoryOrClass.class;
    } else {
      Modifier = factoryOrClass;
    }

    // This looks superfluous, but this is creating a new instance
    // of a function -- this is important so that each instance of the
    // created modifier can have its own state which is stored in
    // the MODIFIER_ELEMENTS and MODIFIER_TEARDOWNS WeakMaps
    return (...args) => Modifier(...args);
  }

  installModifier(
    modifier: FunctionalModifier,
    element: Element,
    args: ModifierArgs
  ): void {
    MODIFIER_ELEMENTS.set(modifier, element);

    if (gte('3.22.0')) {
      consumeArgs(args);
    }

    setup(modifier, element, args);
  }

  updateModifier(modifier: FunctionalModifier, args: ModifierArgs): void {
    const element = MODIFIER_ELEMENTS.get(modifier);

    teardown(modifier);

    if (gte('3.22.0')) {
      consumeArgs(args);
    }

    setup(modifier, element, args);
  }

  destroyModifier(modifier: FunctionalModifier): void {
    teardown(modifier);
  }
}

export default new FunctionalModifierManager();
