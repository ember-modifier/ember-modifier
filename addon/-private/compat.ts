import { gte } from 'ember-compatibility-helpers';
import { ArgsFor } from './signature';

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
let consumeArgs: <S>(args: ArgsFor<S>) => void = noop;

if (gte('3.22.0')) {
  consumeArgs = function ({ positional, named }) {
    // SAFETY: TS before 4.6 does not correctly/fully resolve the type in a way
    // that allows the type checker to see that `positional` must *always* be
    // something which `extends unknown[]` here, because the underlying
    // machinery is fairly complicated and relies on a fair bit of type
    // recursion. It will stop mattering when we cut v4.0, because we won't be
    // doing this anyway.
    const pos = positional as unknown[];
    for (let i = 0; i < pos.length; i++) {
      pos[i];
    }

    // SAFETY: TS 4.7 does not see that `named` will always be an object here.
    // However, it is guaranteed to be resolved as such by the types. This *may*
    // be a bug (https://github.com/microsoft/TypeScript/issues/48468), but it
    // *should* also stop being relevant once we ship 4.0.
    Object.values(named as object);
  };
}

export { consumeArgs };
