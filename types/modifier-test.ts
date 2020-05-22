import { expectTypeOf } from 'expect-type';

import Modifier, { modifier, InTeardown, ModifierArgs } from 'ember-modifier';

// --- function modifier --- //
expectTypeOf(modifier).toEqualTypeOf<
  (
    callback: (
      element: Element,
      positional: unknown[],
      named: Record<string, unknown>
    ) => (() => unknown) | void
  ) => unknown
>();

// --- class-based modifier --- //
expectTypeOf(Modifier).constructorParameters.toEqualTypeOf<
  [unknown, ModifierArgs]
>();
expectTypeOf<Modifier['args']>().toEqualTypeOf<ModifierArgs>();
expectTypeOf<Modifier['element']>().toEqualTypeOf<Element>();
expectTypeOf<Modifier['didReceiveArguments']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['didUpdateArguments']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['didInstall']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['willRemove']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['willDestroy']>().toEqualTypeOf<() => void>();
expectTypeOf<Modifier['isDestroying']>().toEqualTypeOf<boolean>();
expectTypeOf<Modifier['isDestroyed']>().toEqualTypeOf<boolean>();

// --- type utilities --- //
expectTypeOf<ModifierArgs>().toEqualTypeOf<{
  named: Record<string, unknown>;
  positional: unknown[];
}>();

// `InTeardown<Modifier>` should be identical to `Modifier` *except* for the
// definition of `element`.
expectTypeOf<InTeardown<Modifier>['element']>().not.toEqualTypeOf<
  Modifier['element']
>();
expectTypeOf<InTeardown<Modifier>['element']>().toEqualTypeOf<null>();

expectTypeOf<InTeardown<Modifier>['args']>().toEqualTypeOf<Modifier['args']>();
expectTypeOf<InTeardown<Modifier>['didReceiveArguments']>().toEqualTypeOf<
  Modifier['didReceiveArguments']
>();
expectTypeOf<InTeardown<Modifier>['didUpdateArguments']>().toEqualTypeOf<
  Modifier['didUpdateArguments']
>();
expectTypeOf<InTeardown<Modifier>['didInstall']>().toEqualTypeOf<
  Modifier['didInstall']
>();
expectTypeOf<InTeardown<Modifier>['willRemove']>().toEqualTypeOf<
  Modifier['willRemove']
>();
expectTypeOf<InTeardown<Modifier>['willDestroy']>().toEqualTypeOf<
  Modifier['willDestroy']
>();
expectTypeOf<InTeardown<Modifier>['isDestroying']>().toEqualTypeOf<
  Modifier['isDestroying']
>();
expectTypeOf<InTeardown<Modifier>['isDestroyed']>().toEqualTypeOf<
  Modifier['isDestroyed']
>();
