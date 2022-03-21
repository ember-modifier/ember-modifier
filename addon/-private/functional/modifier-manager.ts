import { capabilities } from '@ember/modifier';
import { gte } from 'ember-compatibility-helpers';
import type { FunctionalModifierDefinition } from './modifier';
import type { ArgsFor, ElementFor } from '../signature';
import { consumeArgs, Factory, isFactory } from '../compat';
import { assert } from '@ember/debug';

type ElementMap = {
  get<S>(key: FunctionalModifierDefinition<S>): ElementFor<S> | null;
  set<S>(key: FunctionalModifierDefinition<S>, value: ElementFor<S>): void;
};

type TeardownMap = {
  get<S>(key: FunctionalModifierDefinition<S>): unknown;
  set<S>(key: FunctionalModifierDefinition<S>, value: unknown): void;
};

const MODIFIER_ELEMENTS = new WeakMap() as ElementMap;
const MODIFIER_TEARDOWNS = new WeakMap() as TeardownMap;

function teardown<S>(modifier: FunctionalModifierDefinition<S>): void {
  const teardown = MODIFIER_TEARDOWNS.get(modifier);

  if (teardown && typeof teardown === 'function') {
    teardown();
  }
}

function setup<S>(
  modifier: FunctionalModifierDefinition<S>,
  element: ElementFor<S>,
  args: ArgsFor<S>
): void {
  const { positional, named } = args;
  const teardown = modifier(element, positional, named);

  MODIFIER_TEARDOWNS.set(modifier, teardown);
}

class FunctionalModifierManager<S> {
  capabilities = capabilities(gte('3.22.0') ? '3.22' : '3.13');

  createModifier(
    factoryOrClass:
      | Factory<FunctionalModifierDefinition<S>>
      | FunctionalModifierDefinition<S>
  ): FunctionalModifierDefinition<S> {
    const Modifier = isFactory(factoryOrClass)
      ? factoryOrClass.class
      : factoryOrClass;

    // This looks superfluous, but this is creating a new instance
    // of a function -- this is important so that each instance of the
    // created modifier can have its own state which is stored in
    // the MODIFIER_ELEMENTS and MODIFIER_TEARDOWNS WeakMaps
    return (...args) => Modifier(...args);
  }

  installModifier(
    modifier: FunctionalModifierDefinition<S>,
    element: ElementFor<S>,
    args: ArgsFor<S>
  ): void {
    MODIFIER_ELEMENTS.set(modifier, element);

    if (gte('3.22.0')) {
      consumeArgs(args);
    }

    setup(modifier, element, args);
  }

  updateModifier(
    modifier: FunctionalModifierDefinition<S>,
    args: ArgsFor<S>
  ): void {
    const element = MODIFIER_ELEMENTS.get(modifier);

    assert(
      'ember-modifier: called updateModifier without a registered element.\nThis is an internal error; please open a bug!',
      !!element
    );

    teardown(modifier);

    if (gte('3.22.0')) {
      consumeArgs(args);
    }

    setup(modifier, element, args);
  }

  destroyModifier(modifier: FunctionalModifierDefinition<S>): void {
    teardown(modifier);
  }
}

export default new FunctionalModifierManager();
