import { capabilities } from '@ember/modifier';
import type { FunctionBasedModifierDefinition, Teardown } from './modifier';
import type { ArgsFor, ElementFor } from '../signature';

interface State<S> {
  instance: FunctionBasedModifierDefinition<S>;
}

interface CreatedState<S> extends State<S> {
  element: null;
}

interface InstalledState<S> extends State<S> {
  element: ElementFor<S>;
  teardown?: Teardown;
}

// Wraps the unsafe (b/c it mutates, rather than creating new state) code that
// TS does not yet understand.
function installElement<S>(
  state: CreatedState<S>,
  element: ElementFor<S>,
): InstalledState<S> {
  // SAFETY: this cast represents how we are actually handling the state machine
  // transition: from this point forward in the lifecycle of the modifier, it
  // always behaves as `InstalledState<S>`. It is safe because, and *only*
  // because, we immediately initialize `element`. (We cannot create a new state
  // from the old one because the modifier manager API expects mutation of a
  // single state bucket rather than updating it at hook calls.)
  const installedState = state as State<S> as InstalledState<S>;
  installedState.element = element;
  return installedState;
}

export default class FunctionBasedModifierManager<S> {
  capabilities = capabilities('3.22');

  createModifier(
    instance: FunctionBasedModifierDefinition<S>,
  ): CreatedState<S> {
    return { element: null, instance };
  }

  installModifier(
    createdState: CreatedState<S>,
    element: ElementFor<S>,
    args: ArgsFor<S>,
  ): void {
    const state = installElement(createdState, element);

    const { positional, named } = args;
    const teardown = createdState.instance(element, positional, named);
    if (typeof teardown === 'function') {
      state.teardown = teardown;
    }
  }

  updateModifier(state: InstalledState<S>, args: ArgsFor<S>): void {
    if (typeof state.teardown === 'function') {
      state.teardown();
    }

    const teardown = state.instance(state.element, args.positional, args.named);
    if (typeof teardown === 'function') {
      state.teardown = teardown;
    }
  }

  destroyModifier(state: InstalledState<S>): void {
    if (typeof state.teardown === 'function') {
      state.teardown();
    }
  }

  getDebugName(state: InstalledState<S>): string {
    return state.instance.toString();
  }

  getDebugInstance(state: InstalledState<S>): InstalledState<S> {
    return state;
  }
}
