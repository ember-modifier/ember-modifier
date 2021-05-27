import { ModifierArgs } from 'ember-modifier/-private/interfaces';
import { gte } from 'ember-compatibility-helpers';

export interface Factory<T> {
  owner: unknown;
  class: T;
}

export function isFactory<T>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _factoryOrClass: Factory<T> | T
): _factoryOrClass is Factory<T> {
  return !gte('3.22.0');
}

// This is a workaround for a change in the autotracking semantics of the args
// proxy introduced in `3.22`. Arguments are no longer eagerly consumed, so if
// you didn’t use an argument, it won’t be updated.
export function consumeArgs({ positional, named }: ModifierArgs): void {
  for (let i = 0; i < positional.length; i++) {
    positional[i];
  }

  Object.values(named);
}
