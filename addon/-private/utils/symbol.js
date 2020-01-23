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
 */
export const symbol =
  typeof Symbol !== 'undefined'
    ? Symbol
    : (key) => `__${key}${Math.floor(Math.random() * Date.now())}__`;
