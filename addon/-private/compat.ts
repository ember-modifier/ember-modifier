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

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

/**
 * Consume each positional and named argument to entangle it in autotracking and
 * enable updates.
 *
 * This is a temporary workaround for a change in the autotracking semantics of
 * the args proxy introduced in `v3.22`. What changed is that arguments are no
 * longer eagerly consumed. Didn’t use an argument? Then updates won’t be run
 * when its value changes. This workaround reproduces the previous behaviour to
 * avoid introducing a breaking change until a suitable transition path is made
 * available.
 */
let consumeArgs: (args: ModifierArgs) => void = noop;

if (gte('3.22.0')) {
  consumeArgs = function ({ positional, named }) {
    for (let i = 0; i < positional.length; i++) {
      positional[i];
    }

    Object.values(named);
  };
}

export { consumeArgs };
