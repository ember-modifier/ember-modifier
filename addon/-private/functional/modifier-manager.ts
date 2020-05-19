import { capabilities } from "@ember/modifier";
import { FunctionalModifier } from "./modifier";
import { ModifierArgs } from "../interfaces";

interface Factory {
  class: FunctionalModifier;
}

const MODIFIER_ELEMENTS = new WeakMap();
const MODIFIER_TEARDOWNS: WeakMap<FunctionalModifier, unknown> = new WeakMap();

function teardown(modifier: FunctionalModifier) {
  const teardown = MODIFIER_TEARDOWNS.get(modifier);

  if (teardown && typeof teardown === "function") {
    teardown();
  }
}

function setup(
  modifier: FunctionalModifier,
  element: Element,
  args: ModifierArgs
) {
  const { positional, named } = args;
  const teardown = modifier(element, positional, named);

  MODIFIER_TEARDOWNS.set(modifier, teardown);
}

export default class FunctionalModifierManager {
  capabilities = capabilities("3.13");

  constructor(_owner: unknown) {}

  createModifier(factory: Factory): FunctionalModifier {
    const { class: fn } = factory;

    // This looks superfluous, but this is creating a new instance
    // of a function -- this is important so that each instance of the
    // created modifier can have its own state which is stored in
    // the MODIFIER_ELEMENTS and MODIFIER_TEARDOWNS WeakMaps
    return (...args) => fn(...args);
  }

  installModifier(
    modifier: FunctionalModifier,
    element: Element,
    args: ModifierArgs
  ) {
    MODIFIER_ELEMENTS.set(modifier, element);
    setup(modifier, element, args);
  }

  updateModifier(modifier: FunctionalModifier, args: ModifierArgs) {
    const element = MODIFIER_ELEMENTS.get(modifier);

    teardown(modifier);
    setup(modifier, element, args);
  }

  destroyModifier(modifier: FunctionalModifier) {
    teardown(modifier);
  }
}
