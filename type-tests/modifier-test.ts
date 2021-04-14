import { expectTypeOf } from 'expect-type';

import Modifier, { modifier, ModifierArgs } from 'ember-modifier';

// --- function modifier --- //
expectTypeOf(modifier).toEqualTypeOf<
  (
    callback: (
      element: Element,
      positional: unknown[],
      named: Record<string, unknown>
    ) => unknown
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

declare enum Foo {
  Bar,
}

// This is here simply to "assert" by way of type-checking that it's possible
// for each of the arguments to be narrowed.
const narrowerFn = modifier(
  (div: HTMLIFrameElement, pos: [string], named: Record<Foo, number>) => {
    function handler(event: MouseEvent): void {
      console.log(event.clientX, event.clientY, pos[0], named[Foo.Bar]);
    }
    div.addEventListener('mouseenter', handler);

    return () => div.removeEventListener('mouseenter', handler);
  }
);

// Additionally, the type of the resulting modifier should be as we expect.
expectTypeOf(narrowerFn).toEqualTypeOf<unknown>();

// This is here simply to "assert" by way of type-checking that it's possible
// for each of the (type) arguments to be narrowed.
class NarrowerClass extends Modifier<{
  named: { onMessage: (desc: string, data: unknown) => void };
  positional: [string];
}> {
  declare element: HTMLIFrameElement;

  didInstall(): void {
    this.element.contentWindow?.addEventListener('message', this._handle);
  }

  willRemove(): void {
    this.element.contentWindow?.removeEventListener('message', this._handle);
  }

  _handle(event: MessageEvent): void {
    this.args.named.onMessage(this.args.positional[0], event.data);
  }
}

const narrowerClass = new NarrowerClass(
  { iAmAnOwner: 'yep' },
  {
    named: {
      onMessage(desc, data) {
        console.log(desc, JSON.stringify(data, null, 2));
      },
    },
    positional: ['hello'],
  }
);

expectTypeOf(narrowerClass).toMatchTypeOf<{
  args: {
    named: { onMessage: (desc: string, data: unknown) => void };
    positional: [string];
  };
  element: HTMLIFrameElement;
}>();

// --- type utilities --- //
expectTypeOf<ModifierArgs>().toEqualTypeOf<{
  named: Record<string, unknown>;
  positional: unknown[];
}>();
