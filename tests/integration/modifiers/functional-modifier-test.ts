import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { modifier } from 'ember-modifier';
import { tracked } from '@glimmer/tracking';

interface Context extends TestContext {
  state: unknown;
}

module('Integration | Modifiers | functional modifier', function (hooks) {
  setupRenderingTest(hooks);

  module('args', () => {
    test('it passes element as first argument', async function (assert) {
      this.owner.register(
        'modifier:songbird',
        modifier((element) => assert.equal(element.tagName, 'H1'))
      );

      await render(hbs`<h1 {{songbird}}>Hello</h1>`);
    });

    test('positional arguments are passed', async function (assert) {
      this.owner.register(
        'modifier:songbird',
        modifier((_, [a, b]) => {
          assert.equal(a, '1');
          assert.equal(b, '2');
        })
      );

      await render(hbs`<h1 {{songbird "1" "2"}}>Hey</h1>`);
    });

    test('named arguments are passed', async function (assert) {
      this.owner.register(
        'modifier:songbird',
        modifier((_, __, { a, b }: Record<string, string>) => {
          assert.equal(a, '1');
          assert.equal(b, '2');
        })
      );

      await render(hbs`<h1 {{songbird a="1" b="2"}}>Hey</h1>`);
    });
  });

  module('setup/teardown', () => {
    test('teardown method called when removed', async function (this: Context, assert) {
      let callCount = 0;

      class State {
        @tracked shouldRender = true;
        @tracked value = 0;
      }

      const state = (this.state = new State());

      this.owner.register(
        'modifier:songbird',
        modifier(() => () => callCount++)
      );

      await render(hbs`
        {{#if this.state.shouldRender}}
          <h1 {{songbird this.state.value}}>Hello</h1>
        {{/if}}
      `);

      assert.equal(callCount, 0);

      state.shouldRender = false;
      await settled();

      assert.equal(callCount, 1);
    });

    test('setup is invoked for each change', async function (this: Context, assert) {
      class State {
        @tracked value = 0;
      }

      const state = (this.state = new State());

      let callCount = 0;

      this.owner.register(
        'modifier:songbird',
        modifier((_, [value]) => {
          value;
          callCount++;
        })
      );

      await render(hbs`<h1 {{songbird this.state.value}}>Hello</h1>`);

      assert.equal(callCount, 1);

      state.value = 1;
      await settled();

      assert.equal(callCount, 2);
    });

    test('teardown is invoked for each change', async function (this: Context, assert) {
      class State {
        @tracked value = 0;
      }

      const state = (this.state = new State());

      let callCount = 0;

      this.owner.register(
        'modifier:songbird',
        modifier((_, [value]) => {
          value;
          return () => callCount++;
        })
      );

      await render(hbs`<h1 {{songbird this.state.value}}>Hello</h1>`);

      assert.equal(callCount, 0);

      state.value = 1;
      await settled();

      assert.equal(callCount, 1);
    });

    test('teardown is invoked for each modifier instance', async function (this: Context, assert) {
      const teardownCalls: string[] = [];

      class State {
        @tracked isRendered = true;
      }

      const state = (this.state = new State());

      this.owner.register(
        `modifier:songbird`,
        modifier((_, [val]: [string]) => {
          val;
          return () => teardownCalls.push(val);
        })
      );

      await render(hbs`
        {{#if this.state.isRendered}}
          <h1 {{songbird "A"}}>A</h1>
          <h1 {{songbird "B"}}>B</h1>
        {{/if}}
      `);

      state.isRendered = false;
      await settled();

      assert.equal(teardownCalls.length, 2);
      assert.ok(teardownCalls.includes('A'));
      assert.ok(teardownCalls.includes('B'));
    });
  });

  test('auto-tracking behavior', async function (this: Context, assert) {
    let callCount = 0;

    class State {
      @tracked a = 123;
      @tracked b = 456;
    }

    const state = (this.state = new State());

    // For the modern behavior, we *do* need to consume the args to be updated
    // when they change. Here, we consume `state.a` but *not* `state.b`, and
    // test setting both `a` and `b` below.
    this.owner.register(
      'modifier:explicitly-lazy',
      modifier((_el: Element, _pos: [], state: State) => {
        state.a;
        callCount++;
      })
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
