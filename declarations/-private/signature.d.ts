/** @private */
export type ElementFor<S> = 'Element' extends keyof S ? S['Element'] extends Element ? S['Element'] : Element : Element;
type DefaultPositional = [];
type GetOrElse<T, K, Fallback> = K extends keyof T ? T[K] : Fallback;
/**
 * A convenience type utility, primarily for working with args in the `modify`
 * hook on class-based modifiers. Given a signature `S` it will return the
 * correct positional args for that signature. For example:
 *
 * ```ts
 * import Modifier, { NamedArgs } from 'ember-modifier';
 *
 * interface OnClickOutsideSig {
 *   Args: {
 *     Positional: [handler: () => void];
 *   };
 * }
 *
 * export default class Example extends Modifier<OnClickOutsideSig> {
 *   element = null;
 *
 *   modify(el: Element, _: [handler]: PositionalArgs<OnClickOutsideSig>) {
 *     if (!this.element) {
 *       this.element = el;
 *     }
 *
 *     this.clearHandler();
 *     this.handler = handler;
 *
 *     document.addEventListener('click', this.onClickOutside);
 *
 *     // Normally this would be better done in `constructor` or similar.
 *     unregisterDestructor(this, this.clearHandler);
 *     registerDestructor(this, this.clearHandler);
 *   }
 *
 *   onClickOutside = (event: MouseEvent) => {
 *     // SAFETY: a "standard" safe cast for event.target here
 *     if (!this.element.contains(event.target as Node)) {
 *       this.handler();
 *     }
 *   }
 *
 *   clearHandler = () => {
 *     document.removeEventListener('click', this.onClickOutside);
 *   }
 * }
 * ```
 *
 * (This example does not need to be, and should not be, class-based, but is
 * useful to illustrate how to use the type utility.)
 */
export type PositionalArgs<S> = 'Args' extends keyof S ? GetOrElse<S['Args'], 'Positional', DefaultPositional> : DefaultPositional;
declare const Empty: unique symbol;
export interface EmptyObject {
    [Empty]?: true;
}
type DefaultNamed = EmptyObject;
/**
 * A convenience type utility, primarily for working with args in the `modify`
 * hook on class-based modifiers. Given a signature `S` it will return the
 * correct named args for that signature:
 *
 * ```ts
 * import Modifier, { NamedArgs } from 'ember-modifier';
 *
 * interface PlaySig {
 *   Element: HTMLElement;
 *   Args: {
 *     Named: {
 *       when: string;
 *     };
 *   };
 * }
 *
 * export default class Example extends Modifier<Sig> {
 *   modify(el: HTMLMediaElement, _: [], { when: shouldPlay }: NamedArgs<PlaySig>) {
 *     if (shouldPlay) {
 *       el.play();
 *     } else {
 *       el.pause();
 *     }
 *   }
 * }
 * ```
 *
 * (This example does not need to be, and should not be, class-based, but is
 * useful to illustrate the point.)
 */
export type NamedArgs<S> = 'Args' extends keyof S ? GetOrElse<S['Args'], 'Named', DefaultNamed> : DefaultNamed;
/** @private */
export interface DefaultSignature {
    Element: Element;
}
/**
 * A convenience type utility, primarily for working with args in the `modify`
 * hook on class-based modifiers. Given a signature `S` it will return the
 * correct positional args for that signature, to be used with
 */
export interface ArgsFor<S> {
    named: NamedArgs<S>;
    positional: PositionalArgs<S>;
}
export {};
//# sourceMappingURL=signature.d.ts.map