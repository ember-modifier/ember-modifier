import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import type { TestContext as BaseContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { modifier } from 'ember-modifier';
import { tracked } from '@glimmer/tracking';

type ModifierReturn = ReturnType<typeof modifier>;

interface TestContext extends BaseContext {
  registerModifier(name: string, modifier: ModifierReturn): void;
  shouldRender?: boolean;
  isRendered?: boolean;
  value?: number;
  state?: unknown;
}

module('Integration | Modifiers | functional modifier', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.registerModifier = (name, modifier) => {
      this.owner.register(`modifier:${name}`, modifier);
    };
  });

  module('args', () => {
    test('it passes element as first argument', async function (this: TestContext, assert) {
      this.registerModifier(
        'songbird',
        modifier((element) => assert.equal(element.tagName, 'H1'))
      );

      await render(hbs`<h1 {{songbird}}>Hello</h1>`);
    });

    test('positional arguments are passed', async function (this: TestContext, assert) {
      this.registerModifier(
        'songbird',
        modifier((_, [a, b]) => {
          assert.equal(a, '1');
          assert.equal(b, '2');
        })
      );

      await render(hbs`<h1 {{songbird "1" "2"}}>Hey</h1>`);
    });

    test('named arguments are passed', async function (this: TestContext, assert) {
      this.registerModifier(
        'songbird',
        modifier((_, __, { a, b }) => {
          assert.equal(a, '1');
          assert.equal(b, '2');
        })
      );

      await render(hbs`<h1 {{songbird a="1" b="2"}}>Hey</h1>`);
    });
  });

  module('setup/teardown', () => {
    test('teardown method called when removed', async function (this: TestContext, assert) {
      let callCount = 0;
      this.shouldRender = true;
      this.value = 0;

      this.registerModifier(
        'songbird',
        modifier(() => () => callCount++)
      );

      await render(hbs`
        {{#if this.shouldRender}}
          <h1 {{songbird this.value}}>Hello</h1>
        {{/if}}
      `);

      assert.equal(callCount, 0);

      this.set('shouldRender', false);

      await settled();

      assert.equal(callCount, 1);
    });

    test('setup is invoked for each change', async function (this: TestContext, assert) {
      let callCount = 0;
      this.value = 0;

      this.registerModifier(
        'songbird',
        modifier(() => {
          callCount++;
        })
      );

      await render(hbs`<h1 {{songbird this.value}}>Hello</h1>`);

      assert.equal(callCount, 1);

      this.set('value', 1);

      await settled();

      assert.equal(callCount, 2);
    });

    test('teardown is invoked for each change', async function (this: TestContext, assert) {
      let callCount = 0;
      this.value = 0;

      this.registerModifier(
        'songbird',
        modifier(() => () => callCount++)
      );

      await render(hbs`<h1 {{songbird this.value}}>Hello</h1>`);

      assert.equal(callCount, 0);

      this.set('value', 1);

      await settled();

      assert.equal(callCount, 1);
    });

    test('teardown is invoked for each modifier instance', async function (this: TestContext, assert) {
      const teardownCalls: string[] = [];
      this.isRendered = true;

      this.registerModifier(
        'songbird',
        modifier(
          (_, [val]: [string]) =>
            () =>
              teardownCalls.push(val)
        )
      );

      await render(hbs`
        {{#if this.isRendered}}
          <h1 {{songbird "A"}}>A</h1>
          <h1 {{songbird "B"}}>B</h1>
        {{/if}}
      `);

      this.set('isRendered', false);

      await settled();

      assert.equal(teardownCalls.length, 2);
      assert.ok(teardownCalls.includes('A'));
      assert.ok(teardownCalls.includes('B'));
    });
  });

  module('auto-tracking behavior', function () {
    class State {
      @tracked a = 123;
      @tracked b = 456;
    }

    module('legacy', function () {
      test('by defaulting with no options object', async function (this: TestContext, assert) {
        let callCount = 0;

        const state = (this.state = new State());

        // For legacy behavior, we do not need to consume args *at all*. We just
        // need to invoke the modifier with them and then change them.
        this.owner.register(
          'modifier:legacy',
          modifier(() => {
            callCount++;
          })
        );

        await render(hbs`
          <div {{legacy this.state.a this.state.b}}></div>
        `);
        assert.step('first render');
        assert.equal(callCount, 1, 'installation runs the modifier');

        state.a = 234;
        await settled();
        assert.step('second render');
        assert.equal(callCount, 2, 'updating unused arg a runs the modifier');

        state.b = 987;
        await settled();
        assert.step('third render');
        assert.equal(callCount, 3, 'updating unused arg b runs the modifier');

        assert.verifySteps(['first render', 'second render', 'third render']);
      });

      test('by passing `{ eager: true }` explicitly', async function (this: TestContext, assert) {
        let callCount = 0;

        const state = (this.state = new State());

        // For legacy behavior, we do not need to consume args *at all*. We just
        // need to invoke the modifier with them and then change them.
        this.owner.register(
          'modifier:explicitly-eager',
          modifier(
            () => {
              callCount++;
            },
            { eager: true }
          )
        );

        await render(hbs`
          <div {{explicitly-eager this.state.a this.state.b}}></div>
        `);
        assert.step('first render');
        assert.equal(callCount, 1, 'installation runs the modifier');

        state.a = 234;
        await settled();
        assert.step('second render');
        assert.equal(callCount, 2, 'updating unused arg a runs the modifier');

        state.b = 987;
        await settled();
        assert.step('third render');
        assert.equal(callCount, 3, 'updating unused arg b runs the modifier');

        assert.verifySteps(['first render', 'second render', 'third render']);
      });
    });

    test('with `{ eager: false }`', async function (this: TestContext, assert) {
      let callCount = 0;

      const state = (this.state = new State());

      // For the modern behavior, we *do* need to consume the args to be updated
      // when they change. Here, we consume `state.a` but *not* `state.b`, and
      // test setting both `a` and `b` below.
      this.owner.register(
        'modifier:explicitly-lazy',
        modifier(
          (_el: Element, _pos: [], state: State) => {
            state.a;
            callCount++;
          },
          { eager: false }
        )
      );

      await render(hbs`
        <div {{explicitly-lazy a=this.state.a b=this.state.b}}></div>
      `);
      assert.step('first render');
      assert.equal(callCount, 1, 'installation runs the modifier');

      state.a = 234;
      await settled();
      assert.step('second render');
      assert.equal(callCount, 2, 'updating used arg a runs the modifier');

      state.b = 987;
      await settled();
      assert.step('third render');
      assert.equal(
        callCount,
        2,
        'updating unused arg b does not run the modifier'
      );

      assert.verifySteps(['first render', 'second render', 'third render']);
    });
  });
});
