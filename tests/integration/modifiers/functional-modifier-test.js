import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { modifier } from 'ember-modifier';

module('Integration | Modifiers | functional modifier', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.registerModifier = (name, modifier) => {
      this.owner.register(`modifier:${name}`, modifier);
    };
  });

  module('args', () => {
    test('it passes element as first argument', async function(assert) {
      this.registerModifier(
        'songbird',
        modifier(element => assert.equal(element.tagName, 'H1'))
      );

      await render(hbs`<h1 {{songbird}}>Hello</h1>`);
    });

    test('positional arguments are passed', async function(assert) {
      this.registerModifier(
        'songbird',
        modifier((_, [a, b]) => {
          assert.equal(a, '1');
          assert.equal(b, '2');
        })
      );

      await render(hbs`<h1 {{songbird "1" "2"}}>Hey</h1>`);
    });

    test('named arguments are passed', async function(assert) {
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
    test('teardown method called when removed', async function(assert) {
      let callCount = 0;
      this.shouldRender = true;

      this.registerModifier(
        'songbird',
        modifier(() => () => callCount++)
      );

      await render(hbs`
        {{#if this.shouldRender}}
          <h1 {{songbird value}}>Hello</h1>
        {{/if}}
      `);

      assert.equal(callCount, 0);

      this.set('shouldRender', false);

      await settled();

      assert.equal(callCount, 1);
    });

    test('setup is invoked for each change', async function(assert) {
      let callCount = 0;
      this.value = 0;

      this.registerModifier(
        'songbird',
        modifier(() => callCount++)
      );

      await render(hbs`<h1 {{songbird value}}>Hello</h1>`);

      assert.equal(callCount, 1);

      this.set('value', 1);

      await settled();

      assert.equal(callCount, 2);
    });

    test('teardown is invoked for each change', async function(assert) {
      let callCount = 0;
      this.value = 0;

      this.registerModifier(
        'songbird',
        modifier(() => () => callCount++)
      );

      await render(hbs`<h1 {{songbird value}}>Hello</h1>`);

      assert.equal(callCount, 0);

      this.set('value', 1);

      await settled();

      assert.equal(callCount, 1);
    });

    test('teardown is invoked for each modifier instance', async function(assert) {
      let teardownCalls = [];
      this.isRendered = true;

      this.registerModifier(
        'songbird',
        modifier((_, [val]) => () => teardownCalls.push(val))
      );

      await render(hbs`
        {{#if isRendered}}
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
});
