import { capabilities } from '@ember/modifier';

import { ModifierArgs, ModifierFactory } from 'ember-modifier/types';

type FunctionalModifier =
  <Positional, Named>(
    element: HTMLElement,
    positional: Positional,
    named: Named) => () => void;

type Factory = ModifierFactory<Function>;

const MODIFIER_ELEMENTS = new WeakMap();
const MODIFIER_TEARDOWNS = new WeakMap();

function teardown(modifier: FunctionalModifier) {
  const teardown = MODIFIER_TEARDOWNS.get(modifier);

  if (teardown && typeof teardown === 'function') {
    teardown();
  }
}

function setup<Args extends ModifierArgs>(modifier: FunctionalModifier, element: HTMLElement, args: Args) {
  const { positional, named } = args;
  const teardown = modifier(element, positional, named);

  MODIFIER_TEARDOWNS.set(modifier, teardown);
}

export default class FunctionalModifierManager {
  capabilities = capabilities('3.13');

  createModifier(factory: Factory) {
    const { class: fn } = factory;

    // This looks superfluous, but this is creating a new instance
    // of a function -- this is important so that each instance of the
    // created modifier can have its own state which is stored in
    // the MODIFIER_ELEMENTS and MODIFIER_TEARDOWNS WeakMaps
    return (...args: any[]) => fn(...args);
  }

  installModifier<Args extends ModifierArgs>(modifier: FunctionalModifier, element: HTMLElement, args: Args) {
    MODIFIER_ELEMENTS.set(modifier, element);
    setup(modifier, element, args);
  }

  updateModifier<Args extends ModifierArgs>(modifier: FunctionalModifier, args: Args) {
    const element = MODIFIER_ELEMENTS.get(modifier);

    teardown(modifier);
    setup(modifier, element, args);
  }

  destroyModifier(modifier: FunctionalModifier) {
    teardown(modifier);
  }
}
