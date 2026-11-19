/* eslint-disable @stylistic/no-extra-parens -- Parentheses seal the optional receiver under test. */
import { withRealmSelf, withWindowWithoutSelf } from './window-without-self-host.js';

QUnit.test('resolved statics preserve receiver, store, key and argument order', assert => {
  const effects = [];
  let held;
  const value = (effects.push('receiver'), held = Array)[(effects.push('key'), 'from')]((effects.push('arg'), 'ab')).at(0);
  assert.same(value, 'a');
  assert.same(typeof held, 'function');
  assert.deepEqual(effects, ['receiver', 'key', 'arg']);
});

QUnit.test('resolved static guard and seal keep live argument claims', assert => {
  withWindowWithoutSelf(() => withRealmSelf(() => {
    const effects = [];
    const live = globalThis.window?.Array.from((effects.push('live'), 'ab')).at(0);
    assert.same(live, 'a');
    // eslint-disable-next-line no-unsafe-optional-chaining -- This seal must keep its throwing read.
    const sealed = (globalThis.window?.self).Array.from((effects.push('sealed'), 'ab')).at(0);
    assert.same(sealed, 'a');
    assert.deepEqual(effects, ['live', 'sealed']);
  }));
});
