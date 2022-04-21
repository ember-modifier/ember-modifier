import { expectTypeOf } from 'expect-type';

import Modifier, { ArgsFor, modifier } from 'ember-modifier';
import {
  FunctionBasedModifier,
  FunctionBasedModifierInstance,
} from 'ember-modifier/-private/function-based/modifier';
import { registerDestructor } from '@ember/destroyable';

// Importing private API to confirm that (a) this is stable and (b) it is used
// where we expect to normalize types.
import { EmptyObject } from 'ember-modifier/-private/signature';

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
  [unknown, ArgsFor<unknown>]
>();

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
  }
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

interface TestElementOnly {
  Element: HTMLCanvasElement;
}

const elementOnly = modifier<TestElementOnly>((el, pos, named) => {
  expectTypeOf(el).toEqualTypeOf<HTMLCanvasElement>();
  expectTypeOf(pos).toEqualTypeOf<[]>();
  expectTypeOf(named).toEqualTypeOf<EmptyObject>();
});

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

const namedArgsOnly = modifier<NamedArgsOnly>((el, pos, named) => {
  expectTypeOf(el).toEqualTypeOf<Element>();
  expectTypeOf(pos).toEqualTypeOf<[]>();
  expectTypeOf(named).toEqualTypeOf<NamedArgsOnly['Args']['Named']>();
});

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

const positionalArgsOnly = modifier<PositionalArgsOnly>((el, pos, named) => {
  expectTypeOf(el).toEqualTypeOf<Element>();
  expectTypeOf(pos).toEqualTypeOf<PositionalArgsOnly['Args']['Positional']>();
  expectTypeOf(named).toEqualTypeOf<EmptyObject>();
});

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

const argsOnly = modifier<ArgsOnly>((el, pos, named) => {
  expectTypeOf(el).toEqualTypeOf<Element>();
  expectTypeOf(pos).toEqualTypeOf<ArgsOnly['Args']['Positional']>();
  expectTypeOf(named).toEqualTypeOf<ArgsOnly['Args']['Named']>();
});

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

const full = modifier<Full>((el, pos, named) => {
  expectTypeOf(el).toEqualTypeOf<Full['Element']>();
  expectTypeOf(pos).toEqualTypeOf<Full['Args']['Positional']>();
  expectTypeOf(named).toEqualTypeOf<Full['Args']['Named']>();
});

expectTypeOf(full).toEqualTypeOf<FunctionBasedModifier<Full>>();

// This form is allowed (because we cannot make the inference-driven appraoch
// work otherwise!), but `Signature` is preferred
const uselessForm = modifier<HTMLAnchorElement, [string], { neat: true }>(
  (el, pos, named) => {
    expectTypeOf(el).toEqualTypeOf<HTMLAnchorElement>();
    expectTypeOf(pos).toEqualTypeOf<[string]>();
    expectTypeOf(named).toEqualTypeOf<{ neat: true }>();
  }
);

expectTypeOf(uselessForm).toEqualTypeOf<
  FunctionBasedModifier<{
    Element: HTMLAnchorElement;
    Args: {
      Named: { neat: true };
      Positional: [string];
    };
  }>
>();

const genericModifier = modifier(
  <T>(_: Element, positional: [item: T, callback: (item: T) => void]) => {
    return () => positional[1](positional[0]);
  }
);

expectTypeOf(genericModifier).toEqualTypeOf<
  abstract new <T>() => FunctionBasedModifierInstance<{
    Args: {
      Positional: [item: T, callback: (item: T) => void];
      Named: EmptyObject;
    };
    Element: Element;
  }>
>();

// @ts-expect-error: functional modifiers are not constructible
new genericModifier();

// @ts-expect-error: it's not possible to subclass a functional modifier
class GenericSubclass extends genericModifier<string> {} // eslint-disable-line @typescript-eslint/no-unused-vars

// This is here simply to "assert" by way of type-checking that it's possible
// for each of the (type) arguments to be narrowed.
interface ClassBasedSignature {
  Args: {
    Named: { onMessage: (desc: string, data: unknown) => void };
    Positional: [string];
  };
  Element: HTMLIFrameElement;
}

// This is the preferred form going forward, and serves to validate that
// narrowing works and that inference flows from the signature as expected.
function cleanup({ element, handle }: ClassBased): void {
  if (element && handle) {
    element.contentWindow?.removeEventListener('message', handle);
  }
}

class ClassBased extends Modifier<ClassBasedSignature> {
  element?: ClassBasedSignature['Element'];
  handle?: (event: MessageEvent) => void;

  constructor(owner: unknown, args: ArgsFor<ClassBasedSignature>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  modify(
    element: HTMLIFrameElement,
    [desc]: [string],
    { onMessage }: { onMessage: (desc: string, data: unknown) => void }
  ): void {
    this.element = element;
    this.handle = (event) => onMessage(desc, event.data);
    element.contentWindow?.addEventListener('message', this.handle);
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

expectTypeOf(classBased.modify).parameters.toEqualTypeOf<
  [
    element: ClassBasedSignature['Element'],
    positional: ClassBasedSignature['Args']['Positional'],
    named: ClassBasedSignature['Args']['Named']
  ]
>();

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
