/**
 * This symbol provides a Symbol replacement for browsers that do not have it
 * (eg. IE 11).
 *
 * The replacement is different from the native Symbol in some ways. It is a
 * function that produces an output:
 * - iterable;
 * - that is a string, not a symbol.
 *
 * This is inspired by:
 * https://github.com/emberjs/data/blob/master/packages/store/addon/-private/ts-interfaces/utils/symbol.ts
 *
 * @warning ___SAFETY:___ this may *only* be used internally, and *only* to
 *   construct something with the semantics of `unique symbol`. TypeScript
 *   special-cases the APIs for `Symbol`; they're the *only* way to safely
 *   construct a `unique symbol`, so we work around that by returning `any`
 *   here.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const symbol: (key: string) => any =
  typeof Symbol !== "undefined"
    ? Symbol
    : (key: string) => `__${key}${Math.floor(Math.random() * Date.now())}__`;
