import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import Service, { inject as service } from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import Modifier from 'ember-modifier';
import type {
  ArgsFor,
  DefaultSignature,
  NamedArgs,
  PositionalArgs,
} from 'ember-modifier';
import { tracked } from '@glimmer/tracking';

module(
  'Integration | Modifier Manager | class-based modifier',
  function (hooks) {
    setupRenderingTest(hooks);

    test('the constructor', async function (assert) {
      assert.expect(11);

      let callCount = 0;
      class UsingConstructor extends Modifier {
        constructor(owner: unknown, args: ArgsFor<DefaultSignature>) {
          super(owner, args);
          assert.strictEqual(callCount, 0, 'has initially never been called');
          callCount += 1;

          assert.strictEqual(
            arguments.length,
            2,
            'receives exactly two arguments'
          );
          assert.true('named' in args, 'the `args` has a `named` field');
          assert.strictEqual(typeof args.named, 'object', 'which is an object');
          assert.true(
            'positional' in args,
            'the `args` has a `positional` field'
          );
          assert.true(Array.isArray(args.positional), 'which is an array');
        }
      }

      this.owner.register('modifier:using-constructor', UsingConstructor);

      class State {
        @tracked pos = 'pos';
        @tracked named = 'named';
      }
      const state = new State();
      this.set('state', state);

      await render(hbs`
        <h1 id="expected" {{using-constructor this.state.pos named=this.state.named}}>Hello</h1>
      `);

      assert.step('construction');

      state.pos = 'new pos';
      await settled();
      assert.step('first rerender');

      state.named = 'new named';
      await settled();
      assert.step('second rerender');

      assert.strictEqual(callCount, 1, 'only gets called once');
      assert.verifySteps(['construction', 'first rerender', 'second rerender']);
    });

    test('the `modify` hook', async function (assert) {
      assert.expect(25);

      interface ModifySig {
        Element: HTMLParagraphElement;
        Args: {
          Named: {
            name: string;
            age: number;
          };
          Positional: [greet: string, farewell: string];
        };
      }

      class State {
        @tracked greet = 'hello';
        @tracked farewell = 'goodbye';
        @tracked name = 'Chris';
        @tracked age = 34;
      }

      const state = new State();
      this.set('state', state); // RFC 785

      let modifyCallCount = 0;

      class UsingModify extends Modifier<ModifySig> {
        constructor(owner: unknown, args: ArgsFor<ModifySig>) {
          super(owner, args);
          assert.strictEqual(arguments.length, 2, '');
        }

        modify(
          element: HTMLParagraphElement,
          positional: PositionalArgs<ModifySig>,
          named: NamedArgs<ModifySig>
        ): void {
          modifyCallCount += 1;
          assert.true(
            element instanceof HTMLParagraphElement,
            'receives the element correctly'
          );
          assert.strictEqual(
            positional.length,
            2,
            'receives all positional args'
          );
          assert.strictEqual(
            positional[0],
            state.greet,
            'receives 1st positional arg'
          );
          assert.strictEqual(
            positional[1],
            state.farewell,
            'receives 2nd positional arg'
          );

          // Intentionally do not use `named.age`, so that we can test that
          // modify is appropriately "lazy" about what it consumes: triggering
          // a `set` operation on it will not
          assert.strictEqual(
            typeof named,
            'object',
            'receives a named args object'
          );
          assert.strictEqual(
            named.name,
            state.name,
            'receives correct named args'
          );
        }
      }

      this.owner.register('modifier:using-modify', UsingModify);

      await render(hbs`
        <p {{using-modify this.state.greet this.state.farewell name=this.state.name}}></p>
      `);

      assert.step('initial render');

      state.greet = 'ahoy';
      await settled();
      assert.step('second render');

      state.name = 'Krycho';
      await settled();
      assert.step('third render');

      // This should *not* trigger `modify`, so the call count will remain 3.
      state.age = 35;
      await settled();
      assert.step('fourth render');

      assert.strictEqual(
        modifyCallCount,
        3,
        'is called once each for installation and each update to args it actually uses'
      );
      assert.verifySteps([
        'initial render',
        'second render',
        'third render',
        'fourth render',
      ]);
    });

    module('service injection', function () {
      test('can participate in ember dependency injection', async function (assert) {
        assert.expect(3);

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

          constructor(owner: unknown, args: ArgsFor<DefaultSignature>) {
            super(owner, args);

            called = true;

            assert.true(this.foo.isFooService, 'this.foo.isFooService');
            assert.true(this.baz.isBarService, 'this.baz.isBarService');
          }
        }
        this.owner.register('modifier:songbird', NativeModifier);

        await render(hbs`<h1 {{songbird}}>Hello</h1>`);

        assert.true(called, 'constructor called');
      });
    });
  }
);
