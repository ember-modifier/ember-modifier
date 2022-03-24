import { expectTypeOf } from 'expect-type';

import Modifier, { modifier, ModifierArgs } from 'ember-modifier';
import { FunctionBasedModifier } from 'ember-modifier/-private/functional/modifier';

// --- function modifier --- //
expectTypeOf(modifier).toMatchTypeOf<
  (
    fn: (
      element: Element,
      positional: unknown[],
      named: Record<string, unknown>
    ) => void | (() => void)
  ) => FunctionBasedModifier<{
    Args: { Named: Record<string, unknown>; Positional: unknown[] };
    Element: Element;
  }>
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
expectTypeOf(narrowerFn).toEqualTypeOf<
  FunctionBasedModifier<{
    Args: {
      Named: Record<Foo, number>;
      Positional: [string];
    };
    Element: HTMLIFrameElement;
  }>
>();

const narrowerFnWithEagerFalse = modifier(
  (div: HTMLIFrameElement, pos: [string], named: Record<Foo, number>) => {
    function handler(event: MouseEvent): void {
      console.log(event.clientX, event.clientY, pos[0], named[Foo.Bar]);
    }
    div.addEventListener('mouseenter', handler);

    return () => div.removeEventListener('mouseenter', handler);
  },
  { eager: false }
);

// Additionally, the type of the resulting modifier should be as we expect.
expectTypeOf(narrowerFnWithEagerFalse).toEqualTypeOf<
  FunctionBasedModifier<{
    Args: {
      Named: Record<Foo, number>;
      Positional: [string];
    };
    Element: HTMLIFrameElement;
  }>
>();

const narrowerFnWithEagerTrue = modifier(
  (div: HTMLIFrameElement, pos: [string], named: Record<Foo, number>) => {
    function handler(event: MouseEvent): void {
      console.log(event.clientX, event.clientY, pos[0], named[Foo.Bar]);
    }
    div.addEventListener('mouseenter', handler);

    return () => div.removeEventListener('mouseenter', handler);
  },
  { eager: true }
);

// Additionally, the type of the resulting modifier should be as we expect.
expectTypeOf(narrowerFnWithEagerTrue).toEqualTypeOf<
  FunctionBasedModifier<{
    Args: {
      Named: Record<Foo, number>;
      Positional: [string];
    };
    Element: HTMLIFrameElement;
  }>
>();

interface TestElementOnly {
  Element: HTMLCanvasElement;
}

const elementOnly = modifier<TestElementOnly>(
  (el, pos, named) => {
    expectTypeOf(el).toEqualTypeOf<HTMLCanvasElement>();
    expectTypeOf(pos).toEqualTypeOf<unknown[]>();
    expectTypeOf(named).toEqualTypeOf<object>();
  },
  { eager: false }
);

expectTypeOf(elementOnly).toEqualTypeOf<
  FunctionBasedModifier<{
    Element: HTMLCanvasElement;
  }>
>();

interface NamedArgsOnly {
  Args: {
    Named: {
      name: string;
      age?: number;
    };
  };
}

const namedArgsOnly = modifier<NamedArgsOnly>(
  (el, pos, named) => {
    expectTypeOf(el).toEqualTypeOf<Element>();
    expectTypeOf(pos).toEqualTypeOf<unknown[]>();
    expectTypeOf(named).toEqualTypeOf<NamedArgsOnly['Args']['Named']>();
  },
  { eager: false }
);

expectTypeOf(namedArgsOnly).toEqualTypeOf<
  FunctionBasedModifier<{
    Element: Element;
    Args: {
      Named: NamedArgsOnly['Args']['Named'];
      Positional: unknown[];
    };
  }>
>();

interface PositionalArgsOnly {
  Args: {
    Positional: [name: string, age: number];
  };
}

const positionalArgsOnly = modifier<PositionalArgsOnly>(
  (el, pos, named) => {
    expectTypeOf(el).toEqualTypeOf<Element>();
    expectTypeOf(pos).toEqualTypeOf<PositionalArgsOnly['Args']['Positional']>();
    expectTypeOf(named).toEqualTypeOf<object>();
  },
  { eager: false }
);

expectTypeOf(positionalArgsOnly).toEqualTypeOf<
  FunctionBasedModifier<{
    Element: Element;
    Args: {
      Named: object;
      Positional: PositionalArgsOnly['Args']['Positional'];
    };
  }>
>();

interface ArgsOnly {
  Args: {
    Named: {
      when: boolean;
    };
    Positional: [callback: () => unknown];
  };
}

const argsOnly = modifier<ArgsOnly>(
  (el, pos, named) => {
    expectTypeOf(el).toEqualTypeOf<Element>();
    expectTypeOf(pos).toEqualTypeOf<ArgsOnly['Args']['Positional']>();
    expectTypeOf(named).toEqualTypeOf<ArgsOnly['Args']['Named']>();
  },
  { eager: false }
);

expectTypeOf(argsOnly).toEqualTypeOf<
  FunctionBasedModifier<{
    Element: Element;
    Args: ArgsOnly['Args'];
  }>
>();

interface Full {
  Element: HTMLElement;
  Args: {
    Named: {
      to: string;
      onTarget?: string;
    };
    Positional: [prop: string];
  };
}

const full = modifier<Full>(
  (el, pos, named) => {
    expectTypeOf(el).toEqualTypeOf<Full['Element']>();
    expectTypeOf(pos).toEqualTypeOf<Full['Args']['Positional']>();
    expectTypeOf(named).toEqualTypeOf<Full['Args']['Named']>();
  },
  { eager: false }
);

expectTypeOf(full).toEqualTypeOf<FunctionBasedModifier<Full>>();

// This will be removed at v4 but is currently supported!
const deprecatedForm = modifier<HTMLAnchorElement, [string], { neat: true }>(
  (el, pos, named) => {
    expectTypeOf(el).toEqualTypeOf<HTMLAnchorElement>();
    expectTypeOf(pos).toEqualTypeOf<[string]>();
    expectTypeOf(named).toEqualTypeOf<{ neat: true }>();
  }
);

expectTypeOf(deprecatedForm).toEqualTypeOf<
  FunctionBasedModifier<{
    Element: HTMLAnchorElement;
    Args: {
      Named: { neat: true };
      Positional: [string];
    };
  }>
>();

// This is here simply to "assert" by way of type-checking that it's possible
// for each of the (type) arguments to be narrowed.
class DeprecatedClass extends Modifier<{
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

const deprecatedClass = new DeprecatedClass(
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

expectTypeOf(deprecatedClass).toMatchTypeOf<{
  args: {
    named: { onMessage: (desc: string, data: unknown) => void };
    positional: [string];
  };
  element: HTMLIFrameElement;
}>();

interface ClassBasedSignature {
  Args: {
    Named: { onMessage: (desc: string, data: unknown) => void };
    Positional: [string];
  };
  Element: HTMLIFrameElement;
}

// This is the preferred form going forward, and serves to validate that
// narrowing works and that inference flows from the signature as expected.
class ClassBased extends Modifier<ClassBasedSignature> {
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

const classBased = new ClassBased(
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

expectTypeOf(classBased).toMatchTypeOf<{
  args: {
    named: { onMessage: (desc: string, data: unknown) => void };
    positional: [string];
  };
  element: HTMLIFrameElement;
}>();

// @ts-expect-error -- we should reject returning anything other than a function
// for teardown.
modifier((el) => {
  const timer = setTimeout(() => {
    // whatever, just to use the el
    console.log(el.innerHTML);
  }, 1000);
  return timer;
});

// @ts-expect-error -- we should reject returning functions which expect
// arguments for teardown.
modifier((el) => {
  el;

  return (interval: number) => clearTimeout(interval);
});

// --- type utilities --- //
expectTypeOf<ModifierArgs>().toEqualTypeOf<{
  named: object;
  positional: unknown[];
}>();
