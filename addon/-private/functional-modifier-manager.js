import { capabilities } from '@ember/modifier';

const MODIFIER_ELEMENTS = new WeakMap();
const MODIFIER_TEARDOWNS = new WeakMap();

function teardown(modifier) {
  const teardown = MODIFIER_TEARDOWNS.get(modifier);

  if (teardown && typeof teardown === 'function') {
    teardown();
  }
}

function setup(modifier, element, args) {
  const { positional, named } = args;
  const teardown = modifier(element, positional, named);

  MODIFIER_TEARDOWNS.set(modifier, teardown);
}

export default class FunctionalModifierManager {
  capabilities = capabilities('3.13');

  createModifier(factory) {
    const { class: fn } = factory;

    // This looks superfluous, but this is creating a new instance
    // of a function -- this is important so that each instance of the
    // created modifier can have its own state which is stored in
    // the MODIFIER_ELEMENTS and MODIFIER_TEARDOWNS WeakMaps
    return (...args) => fn(...args);
  }

  installModifier(modifier, element, args) {
    MODIFIER_ELEMENTS.set(modifier, element);
    setup(modifier, element, args);
  }

  updateModifier(modifier, args) {
    const element = MODIFIER_ELEMENTS.get(modifier);

    teardown(modifier);
    setup(modifier, element, args);
  }

  destroyModifier(modifier) {
    teardown(modifier);
  }
}
