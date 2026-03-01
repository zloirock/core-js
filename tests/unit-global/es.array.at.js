import { STRICT } from '../helpers/constants.js';

QUnit.test('Array#at', assert => {
  const { at } = Array.prototype;
  assert.isFunction(at);
  assert.arity(at, 1);
  assert.name(at, 'at');
  assert.looksNative(at);
  assert.nonEnumerable(Array.prototype, 'at');
  assert.same([1, 2, 3].at(0), 1);
  assert.same([1, 2, 3].at(1), 2);
  assert.same([1, 2, 3].at(2), 3);
  assert.same([1, 2, 3].at(3), undefined);
  assert.same([1, 2, 3].at(-1), 3);
  assert.same([1, 2, 3].at(-2), 2);
  assert.same([1, 2, 3].at(-3), 1);
  assert.same([1, 2, 3].at(-4), undefined);
  assert.same([1, 2, 3].at(0.4), 1);
  assert.same([1, 2, 3].at(0.5), 1);
  assert.same([1, 2, 3].at(0.6), 1);
  assert.same([1].at(NaN), 1);
  assert.same([1].at(), 1);
  assert.same([1, 2, 3].at(-0), 1);
  assert.same(Array(1).at(0), undefined);
  assert.same(at.call({ 0: 1, length: 1 }, 0), 1);
  assert.true('at' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
  if (STRICT) {
    assert.throws(() => at.call(null, 0), TypeError);
    assert.throws(() => at.call(undefined, 0), TypeError);
  }
});
