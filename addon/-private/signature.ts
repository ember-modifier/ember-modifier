/**
 * @deprecated use a `Signature` instead (see the README for details).
 */
export interface ModifierArgs {
  /** Positional arguments to a modifier, `{{foo @bar this.baz}}` */
  positional: unknown[];
  /** Named arguments to a modifier, `{{foo bar=this.baz}}` */
  named: Record<string, unknown>;
}

// --- Type utilities for use with Signature types --- //

/** @private */
export type ElementFor<S> = 'Element' extends keyof S
  ? S['Element'] extends Element
    ? S['Element']
    : Element
  : Element;

type DefaultPositional = unknown[];

type Args<S, K, Fallback> = K extends keyof S
  ? S[K] extends Fallback
    ? S[K]
    : Fallback
  : Fallback;

/** @private */
export type PositionalArgs<S> = 'Args' extends keyof S
  ? Args<S['Args'], 'Positional', DefaultPositional>
  : Args<S, 'positional', DefaultPositional>;

type DefaultNamed = object;

/** @private */
export type NamedArgs<S> = 'Args' extends keyof S
  ? Args<S['Args'], 'Named', DefaultNamed>
  : Args<S, 'named', DefaultNamed>;

/** @private */
export interface DefaultSignature {
  Element: Element;
}

export interface ArgsFor<S> {
  named: NamedArgs<S>;
  positional: PositionalArgs<S>;
}
