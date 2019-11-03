import { setOwner } from '@ember/application';
import ApplicationInstance from '@ember/application/instance';

export const DESTROYING = Symbol('destroying');
export const DESTROYED = Symbol('destroyed');

export interface ModifierArgs {
  positional: unknown[];
  named: { [key: string]: unknown };
}

export default class ClassBasedModifier<Args extends ModifierArgs> {
  [DESTROYING] = false;
  [DESTROYED] = false;

  element: Element | null;
  args: Args;

  constructor(owner: ApplicationInstance, args: Args) {
    setOwner(this, owner);
    this.element = null;
    this.args = args;
  }

  didReceiveArguments() {}
  didUpdateArguments() {}
  didInstall() {}
  willRemove() {}
  willDestroy() {}

  get isDestroying() {
    return this[DESTROYING];
  }

  get isDestroyed() {
    return this[DESTROYED];
  }
}

