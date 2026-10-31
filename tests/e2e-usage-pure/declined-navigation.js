/* eslint-disable @stylistic/no-extra-parens -- Nested receiver and key sequences are the input under test. */
import { withRealmSelf, withWindowWithoutSelf } from './window-without-self-host.js';

QUnit.test('declined navigation keeps receiver and key claims live', assert => {
  withWindowWithoutSelf(() => withRealmSelf(() => {
    const effects = [];
    function root() { return globalThis; }
    let held;
    const result = (effects.push('outer'), (held = Array.from('ab').at(0), root()))
      .self.window[(effects.push([7].includes(7)), 'declinedNavigationMissing')];
    assert.same(result, undefined);
    assert.same(held, 'a');
    assert.deepEqual(effects, ['outer', true]);
  }));
});

QUnit.test('declined navigation keeps alias stores and delete order', assert => {
  withWindowWithoutSelf(() => withRealmSelf(() => {
    const effects = [];
    const alias = globalThis;
    function root() { return globalThis; }
    let held;
    assert.same((held = alias).self.window.declinedNavigationMissing, undefined);
    assert.same(held, alias);
    assert.true(delete (effects.push('receiver'), root()).self.window[(effects.push('key'), 'declinedNavigationMissing')]);
    assert.deepEqual(effects, ['receiver', 'key']);
  }));
});
