/* eslint-disable @stylistic/no-extra-parens -- Parenthesized key sequences exercise receiver preparation. */
import { withTemporaryProperty } from '../helpers/restore-property.cjs';
import { withRealmSelf, withRealmSlot, withWindowWithoutSelf } from './window-without-self-host.js';

QUnit.test('dispatch receiver: static key effects precede arguments', assert => {
  const effects = [];
  const value = (effects.push('object'), Number)[(effects.push('key'), 'MAX_SAFE_INTEGER')]
    .toFixed((effects.push('argument'), 0));
  assert.same(value, '9007199254740991');
  assert.deepEqual(effects, ['object', 'key', 'argument']);
  effects.length = 0;
  const optional = (effects.push('object'), Number)[(effects.push('key'), 'MIN_SAFE_INTEGER')]
    ?.toFixed((effects.push('argument'), 0));
  assert.same(optional, '-9007199254740991');
  assert.deepEqual(effects, ['object', 'key', 'argument']);
});

QUnit.test('dispatch receiver: a declined method keeps the static value claim live', assert => {
  const effects = [];
  let result;
  // The source value must come from its import even when this realm has no static.
  function LegacyNumber(value) { return +value; }
  withTemporaryProperty(globalThis, 'Number', LegacyNumber, () => {
    result = (
      effects.push('before'),
      (effects.push('object'), globalThis[(effects.push('ctor'), 'Number')])[(effects.push('key'), 'MAX_SAFE_INTEGER')]
    ).toString();
  });
  assert.same(result, '9007199254740991');
  assert.deepEqual(effects, ['before', 'object', 'ctor', 'key']);
});

QUnit.test('dispatch receiver: a key and argument write cannot replace this', assert => {
  let receiver = [1, 2];
  // eslint-disable-next-line no-useless-assignment -- Both writes must follow the captured receiver.
  const result = receiver?.[(receiver = [3], 'includes')]((receiver = [4], 2));
  assert.same(result, true);
  assert.deepEqual(receiver, [4]);
});

QUnit.test('dispatch receiver: a foreign self property is not a realm hop', assert => {
  const user = { self: { list: [1, 2] } };
  assert.same(user?.self.list.includes(2), true);
  const absent = null;
  let count = 0;
  assert.same(absent?.self.list.includes(count++), undefined);
  assert.same(count, 0);
});

QUnit.test('dispatch receiver: split realm memos retain stores and key effects', assert => {
  withWindowWithoutSelf(() => withRealmSelf(() => withRealmSlot('dispatchReceiverList', [1, 2], () => {
    let held;
    const effects = [];
    assert.same((held = globalThis.window)?.self.dispatchReceiverList.includes(2), true);
    assert.same(held, globalThis.window);
    assert.same(globalThis.window?.[(effects.push('key'), 'self')].dispatchReceiverList.at(0), 1);
    assert.deepEqual(effects, ['key']);
  })));
});

QUnit.test('dispatch receiver: a sealed optional read still throws', assert => {
  const user = null;
  const effects = [];
  // eslint-disable-next-line no-unsafe-optional-chaining -- The sealed access must throw before the argument.
  assert.throws(() => (user?.self).list.includes((effects.push('argument'), 2)), TypeError);
  assert.deepEqual(effects, []);
});
