import { gte, lte } from 'ember-compatibility-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, setupOnerror } from '@ember/test-helpers';
import { TestContext as BaseContext } from 'ember-test-helpers';
import Service, { inject as service } from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import Modifier, { ModifierArgs } from 'ember-modifier';
import ClassBasedModifier from 'ember-modifier';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { setComponentTemplate } from '@ember/component';
import { helper } from '@ember/component/helper';

// `any` required for the inference to work correctly here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConstructorFor<C> = new (...args: any[]) => C;

type Factory = (
  callback: (hookName: string, instance: ClassBasedModifier) => void
) => ConstructorFor<ClassBasedModifier>;

interface HookSetup {
  name: string;
  insert: boolean;
  update: boolean;
  destroy: boolean;
  element: boolean;
  factory: Factory;
}

interface TestContext extends BaseContext {
  instance: null | ClassBasedModifier;
  assertCalled(
    shouldCall: boolean,
    assertion: () => void | Promise<void>
  ): Promise<void>;
  hook(assertions: (instance: ClassBasedModifier) => void): void;
}

function testHook({
  name,
  insert,
  update,
  destroy,
  element,
  factory,
}: HookSetup): void {
  module(`\`${name}\` hook`, function (hooks) {
    hooks.beforeEach(function (this: TestContext, assert) {
      this.instance = null;

      let called = (): void => {
        assert.ok(false, `\`${name}\` hook was called unexpectedly`);
      };

      this.hook = (assertions) => {
        const callback = (
          hookName: string,
          instance: ClassBasedModifier
        ): void => {
          this.instance = instance;

          if (hookName === name) {
            called();

            assert.strictEqual(
              instance.isDestroying,
              name === 'willDestroy' || name === 'willRemove',
              'isDestroying'
            );
            assert.strictEqual(instance.isDestroyed, false, 'isDestroyed');

            assertions(instance);
          }
        };

        this.owner.register('modifier:songbird', factory(callback));
      };

      this.assertCalled = async (shouldCall, callback) => {
        let count = 0;
        const _called = called;

        if (shouldCall) {
          called = () => count++;
        }

        try {
          await callback();
        } finally {
          if (shouldCall) {
            assert.equal(
              count,
              1,
              `Expected \`${name}\` hook to be called exactly once`
            );
          }

          called = _called;
        }
      };
    });

    hooks.afterEach(async function (this: TestContext, assert) {
      await settled();

      assert.strictEqual(this.instance?.isDestroying, true, 'isDestroying');
      assert.strictEqual(this.instance?.isDestroyed, true, 'isDestroyed');
    });

    if (element) {
      test('it has access to the DOM element', async function (this: TestContext, assert) {
        this.hook((instance) => {
          assert.equal(instance.element.tagName, 'H1', 'this.element.tagName');
          assert.equal(instance.element.id, 'expected', 'this.element.id');
        });

        assert.step('no-op render');

        await this.assertCalled(false, async () => {
          this.setProperties({
            isShowing: false,
            foo: 'foo',
          });

          await render(hbs`
            {{#if this.isShowing}}
              <h1 id="expected" {{songbird this.foo}}>Hello</h1>
            {{/if}}
          `);
        });

        assert.step('insert');

        await this.assertCalled(insert, () => {
          this.set('isShowing', true);
        });

        assert.step('update');

        await this.assertCalled(update, () => {
          this.set('foo', 'FOO');
        });

        assert.step('destroy');

        await this.assertCalled(destroy, () => {
          this.set('isShowing', false);
        });

        assert.verifySteps(['no-op render', 'insert', 'update', 'destroy']);
      });
    } else {
      test('it does not have access to the DOM element', async function (this: TestContext, assert) {
        this.hook((instance) => {
          assert.strictEqual(instance.element, null, 'this.element');
        });

        assert.step('no-op render');

        await this.assertCalled(false, async () => {
          this.setProperties({
            isShowing: false,
            foo: 'foo',
          });

          await render(hbs`
            {{#if this.isShowing}}
              <h1 id="expected" {{songbird this.foo}}>Hello</h1>
            {{/if}}
          `);
        });

        assert.step('insert');

        await this.assertCalled(insert, () => {
          this.set('isShowing', true);
        });

        assert.step('update');

        await this.assertCalled(update, () => {
          this.set('foo', 'FOO');
        });

        assert.step('destroy');

        await this.assertCalled(destroy, () => {
          this.set('isShowing', false);
        });

        assert.verifySteps(['no-op render', 'insert', 'update', 'destroy']);
      });
    }

    test('has access to positional arguments', async function (this: TestContext, assert) {
      let expected: string[];

      this.hook((instance) => {
        assert.deepEqual(
          instance.args.positional,
          expected,
          'this.args.positional'
        );
      });

      assert.step('no-op render');

      await this.assertCalled(false, async () => {
        this.setProperties({
          isShowing: false,
          foo: 'foo',
          bar: 'bar',
        });

        await render(hbs`
          {{#if this.isShowing}}
            <h1 id="expected" {{songbird this.foo this.bar}}>Hello</h1>
          {{/if}}
        `);
      });

      assert.step('insert');
      expected = ['foo', 'bar'];

      await this.assertCalled(insert, () => {
        this.set('isShowing', true);
      });

      assert.step('update 1');
      expected = ['FOO', 'bar'];

      await this.assertCalled(update, () => {
        this.set('foo', 'FOO');
      });

      assert.step('update 2');
      expected = ['FOO', 'BAR'];

      await this.assertCalled(update, () => {
        this.set('bar', 'BAR');
      });

      assert.step('destroy');

      await this.assertCalled(destroy, () => {
        this.set('isShowing', false);
      });

      assert.verifySteps([
        'no-op render',
        'insert',
        'update 1',
        'update 2',
        'destroy',
      ]);
    });

    test('has access to named arguments', async function (this: TestContext, assert) {
      let expected: Record<string, string>;

      this.hook((instance) => {
        assert.deepEqual(
          { ...instance.args.named },
          expected,
          'this.args.named'
        );
      });

      assert.step('no-op render');

      await this.assertCalled(false, async () => {
        this.setProperties({
          isShowing: false,
          foo: 'foo',
          bar: 'bar',
        });

        await render(hbs`
          {{#if this.isShowing}}
            <h1 id="expected" {{songbird foo=this.foo bar=this.bar}}>Hello</h1>
          {{/if}}
        `);
      });

      assert.step('insert');
      expected = { foo: 'foo', bar: 'bar' };

      await this.assertCalled(insert, () => {
        this.set('isShowing', true);
      });

      assert.step('update 1');
      expected = { foo: 'FOO', bar: 'bar' };

      await this.assertCalled(update, () => {
        this.set('foo', 'FOO');
      });

      assert.step('update 2');
      expected = { foo: 'FOO', bar: 'BAR' };

      await this.assertCalled(update, () => {
        this.set('bar', 'BAR');
      });

      assert.step('destroy');

      await this.assertCalled(destroy, () => {
        this.set('isShowing', false);
      });

      assert.verifySteps([
        'no-op render',
        'insert',
        'update 1',
        'update 2',
        'destroy',
      ]);
    });
  });
}

function testHooksOrdering(factory: Factory): void {
  module('hooks ordering', function () {
    test('hooks are fired in the right order', async function (this: TestContext, assert) {
      let actualHooks: undefined | string[];

      const callback = (name: string): void => {
        if (actualHooks) {
          actualHooks.push(name);
        } else {
          assert.ok(false, `\`${name}\` hook was called unexpectedly`);
        }
      };

      async function assertHooks(
        expectedHooks: string[],
        callback: () => void | Promise<void>
      ): Promise<void> {
        actualHooks = [];

        try {
          await callback();
        } finally {
          assert.deepEqual(actualHooks, expectedHooks, 'hooks');
          actualHooks = undefined;
        }
      }

      this.owner.register('modifier:songbird', factory(callback));

      assert.step('no-op render');

      await assertHooks([], async () => {
        this.setProperties({
          isShowing: false,
          foo: 'foo',
          bar: 'bar',
        });

        await render(hbs`
          {{#if this.isShowing}}
            <h1 id="expected" {{songbird this.foo bar=this.bar}}>Hello</h1>
          {{/if}}
        `);
      });

      assert.step('insert');

      await assertHooks(
        ['constructor', 'didReceiveArguments', 'didInstall'],
        () => {
          this.set('isShowing', true);
        }
      );

      assert.step('update 1');

      await assertHooks(['didUpdateArguments', 'didReceiveArguments'], () => {
        this.set('foo', 'FOO');
      });

      assert.step('update 2');

      await assertHooks(['didUpdateArguments', 'didReceiveArguments'], () => {
        this.set('bar', 'BAR');
      });

      assert.step('destroy');

      await assertHooks(['willRemove', 'willDestroy'], () => {
        this.set('isShowing', false);
      });

      assert.verifySteps([
        'no-op render',
        'insert',
        'update 1',
        'update 2',
        'destroy',
      ]);
    });
  });
}

function testHooks(factory: Factory): void {
  testHook({
    name: 'constructor',
    insert: true,
    update: false,
    destroy: false,
    element: false,
    factory,
  });

  testHook({
    name: 'didReceiveArguments',
    insert: true,
    update: true,
    destroy: false,
    element: true,
    factory,
  });

  testHook({
    name: 'didUpdateArguments',
    insert: false,
    update: true,
    destroy: false,
    element: true,
    factory,
  });

  testHook({
    name: 'didInstall',
    insert: true,
    update: false,
    destroy: false,
    element: true,
    factory,
  });

  testHook({
    name: 'willRemove',
    insert: false,
    update: false,
    destroy: true,
    element: true,
    factory,
  });

  testHook({
    name: 'willDestroy',
    insert: false,
    update: false,
    destroy: true,
    element: true,
    factory,
  });

  testHooksOrdering(factory);
}

module('Integration | Modifier Manager | class-based modifier', function (
  hooks
) {
  setupRenderingTest(hooks);

  if (gte('3.22.0')) {
    module('capabilities(3.22)', function () {
      testHooks(
        (callback) =>
          class NativeModifier extends Modifier {
            constructor(owner: unknown, args: ModifierArgs) {
              super(owner, args);
              callback('constructor', this);
            }

            didReceiveArguments(): void {
              for (let i = 0; i < this.args.positional.length; i++) {
                // "noop" / consume the arg
                this.args.positional[i];
              }

              for (const key of Object.keys(this.args.named)) {
                // "noop" / consume the arg
                this.args.named[key];
              }

              callback('didReceiveArguments', this);
            }

            didUpdateArguments(): void {
              callback('didUpdateArguments', this);
            }

            didInstall(): void {
              callback('didInstall', this);
            }

            willRemove(): void {
              callback('willRemove', this);
            }

            willDestroy(): void {
              callback('willDestroy', this);
            }
          }
      );
    });
  } else {
    module('capabilities(3.13)', function () {
      testHooks(
        (callback) =>
          class NativeModifier extends Modifier {
            constructor(owner: unknown, args: ModifierArgs) {
              super(owner, args);
              callback('constructor', this);
            }

            didReceiveArguments(): void {
              callback('didReceiveArguments', this);
            }

            didUpdateArguments(): void {
              callback('didUpdateArguments', this);
            }

            didInstall(): void {
              callback('didInstall', this);
            }

            willRemove(): void {
              callback('willRemove', this);
            }

            willDestroy(): void {
              callback('willDestroy', this);
            }
          }
      );
    });
  }

  module('service injection', function () {
    test('can participate in ember dependency injection', async function (this: TestContext, assert) {
      let called = false;

      class Foo extends Service {
        isFooService = true;
      }

      class Bar extends Service {
        isBarService = true;
      }

      this.owner.register('service:foo', Foo);
      this.owner.register('service:bar', Bar);

      class NativeModifier extends Modifier {
        @service foo!: Foo;

        // SAFETY: we're not using the registry here for convenience, because we
        // cannot extend it anywhere but at the top level of the module. The
        // cast is safe because of the registration of `service:bar` above.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @service('bar' as any) baz!: Bar;

        constructor(owner: unknown, args: ModifierArgs) {
          super(owner, args);

          called = true;

          assert.strictEqual(
            this.foo.isFooService,
            true,
            'this.foo.isFooService'
          );
          assert.strictEqual(
            this.baz.isBarService,
            true,
            'this.baz.isBarService'
          );
        }
      }
      this.owner.register('modifier:songbird', NativeModifier);

      await render(hbs`<h1 {{songbird}}>Hello</h1>`);

      assert.strictEqual(called, true, 'constructor called');
    });
  });

  module(
    'Migrating from non-proxied args to proxied args: emberjs/ember.js#19162',
    function () {
      // This test verifies https://github.com/emberjs/ember.js/issues/19162
      // is fixed
      //
      // These tests follow the reproduction:
      // https://ember-twiddle.com/5a3fa797b26e8807869340792219a5ee
      if (gte('3.22.0')) {
        module('capabilities(3.22)', function () {
          test('there is no render error', async function (assert) {
            assert.expect(6);

            const errorMsg = `Unexpected error, because derivedData should not be re-eval'd`;
            const foo = 'foo' as const;
            const baz = 'baz' as const;

            class Baz {
              @tracked kind = baz;
              @tracked nestedData = undefined;
            }

            class Foo {
              @tracked kind = foo;
              @tracked nestedData = new Baz();
            }

            class TestComponent extends Component<{ data: Foo }> {
              @tracked data: Foo = new Foo();

              get derivedData(): string {
                if (!this.args.data.nestedData) {
                  throw new Error(errorMsg);
                }
                return this.args.data.nestedData.kind;
              }
            }

            class CustomModifier extends Modifier {}

            this.owner.register('modifier:custom-modifier', CustomModifier);
            this.owner.register(
              'helper:eq',
              helper(([a, b]) => a === b)
            );
            this.owner.register(
              'component:some-component',
              setComponentTemplate(
                hbs`<div {{custom-modifier this.derivedData}}>{{@data.kind}}</div>`,
                TestComponent
              )
            );

            setupOnerror(function (err: Error) {
              assert.notOk(err, 'Did not expect to error');
            });

            await render(
              hbs`
                {{#if (eq this.data.kind 'foo')}}
                  <SomeComponent @data={{this.data}} />
                {{else}}
                  bar
                {{/if}}
              `
            );

            assert.dom().doesNotContainText('foo');
            assert.dom().containsText('bar');

            this.setProperties({ data: new Foo() });

            assert.dom().containsText('foo');
            assert.dom().doesNotContainText('bar');

            this.setProperties({ data: new Baz() });

            assert.dom().doesNotContainText('foo');
            assert.dom().containsText('bar');
          });
        });
      } else if (gte('3.16')) {
        module('capabilities(3.13)', function () {
          test('there exists render error (args consumed)', async function (assert) {
            assert.expect(1);

            const errorMsg = 'Expected error, because nestedData is undefined';
            const foo = 'foo' as const;
            const baz = 'baz' as const;

            class Baz {
              @tracked kind = baz;
              @tracked nestedData = undefined;
            }

            class Foo {
              @tracked kind = foo;
              @tracked nestedData = new Baz();
            }

            class TestComponent extends Component<{ data: Foo }> {
              @tracked data: Foo = new Foo();

              get derivedData(): string {
                if (!this.args.data.nestedData) {
                  throw new Error(errorMsg);
                }
                return this.args.data.nestedData.kind;
              }
            }

            class CustomModifier extends Modifier {}

            this.owner.register('modifier:custom-modifier', CustomModifier);
            this.owner.register(
              'helper:eq',
              helper(([a, b]) => a === b)
            );
            this.owner.register('component:some-component', TestComponent);
            this.owner.register(
              'template:components/some-component',
              hbs`<div {{custom-modifier this.derivedData}}></div>`
            );

            setupOnerror(function (err: Error) {
              if (err.message !== errorMsg) {
                if (lte('3.16')) {
                  assert.equal(err.message, 'BUG: double release?');
                }

                // ignore other potential errors that could occur
                // (ember 3.4-3.16)
                return;
              }
              assert.equal(err.message, errorMsg);
            });

            this.setProperties({ data: new Foo() });

            await render(
              hbs`
                {{#if (eq this.data.kind 'foo')}}
                  <SomeComponent @data={{this.data}} />
                {{/if}}
              `
            );

            this.setProperties({ data: new Baz() });
          });
        });
      }
    }
  );
});
