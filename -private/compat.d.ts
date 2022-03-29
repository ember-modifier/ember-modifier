import { ArgsFor } from './signature';
export interface Factory<T> {
    owner: unknown;
    class: T;
}
export declare function isFactory<T>(_factoryOrClass: Factory<T> | T): _factoryOrClass is Factory<T>;
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
declare let consumeArgs: <S>(args: ArgsFor<S>) => void;
export { consumeArgs };
