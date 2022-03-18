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

/** @private */
export type PositionalArgs<S> = 'Args' extends keyof S
  ? 'Positional' extends keyof S['Args']
    ? S['Args']['Positional'] extends unknown[]
      ? S['Args']['Positional']
      : DefaultPositional
    : DefaultPositional
  : 'positional' extends keyof S
  ? S['positional']
  : DefaultPositional;

type DefaultNamed = Record<string, unknown>;

/** @private */
export type NamedArgs<S> = 'Args' extends keyof S
  ? 'Named' extends keyof S['Args']
    ? S['Args']['Named'] extends Record<string, unknown>
      ? S['Args']['Named']
      : DefaultNamed
    : DefaultNamed
  : 'named' extends keyof S
  ? S['named']
  : DefaultNamed;

/** @private */
export interface DefaultSignature {
  Element: Element;
}

/** @private */
export interface ArgsFor<S> {
  named: NamedArgs<S>;
  positional: PositionalArgs<S>;
}
