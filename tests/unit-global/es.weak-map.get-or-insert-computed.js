import { STRICT } from '../helpers/constants.js';

QUnit.test('WeakMap#getOrInsertComputed', assert => {
  const { getOrInsertComputed } = WeakMap.prototype;
  assert.isFunction(getOrInsertComputed);
  assert.arity(getOrInsertComputed, 2);
  assert.name(getOrInsertComputed, 'getOrInsertComputed');
  assert.looksNative(getOrInsertComputed);
  assert.nonEnumerable(WeakMap.prototype, 'getOrInsertComputed');

  const a = {};
  const b = {};

  let map = new WeakMap([[a, 2]]);
  assert.same(map.getOrInsertComputed(a, () => 3), 2, 'result#1');
  assert.same(map.get(a), 2, 'map#1');
  map = new WeakMap([[a, 2]]);
  assert.same(map.getOrInsertComputed(b, () => 3), 3, 'result#2');
  assert.same(map.get(a), 2, 'map#2-1');
  assert.same(map.get(b), 3, 'map#2-2');

  map = new WeakMap([[a, 2]]);
  map.getOrInsertComputed(a, () => assert.avoid());

  map = new WeakMap([[a, 2]]);
  map.getOrInsertComputed(b, function (key) {
    if (STRICT) assert.same(this, undefined, 'correct handler in callback');
    assert.same(arguments.length, 1, 'correct number of callback arguments');
    assert.same(key, b, 'correct key in callback');
  });

  map = new WeakMap([[a, 2]]);
  assert.throws(() => {
    map.getOrInsertComputed(1, () => assert.avoid());
  }, TypeError, 'key validation before call of callback');

  assert.throws(() => new WeakMap().getOrInsertComputed(1, () => 3), TypeError, 'invalid key#1');
  assert.throws(() => new WeakMap().getOrInsertComputed(null, () => 3), TypeError, 'invalid key#2');
  assert.throws(() => new WeakMap().getOrInsertComputed(undefined, () => 3), TypeError, 'invalid key#3');
  assert.throws(() => new WeakMap().getOrInsertComputed(a, {}), TypeError, 'non-callable#1');
  assert.throws(() => new WeakMap().getOrInsertComputed(a, 1), TypeError, 'non-callable#2');
  assert.throws(() => new WeakMap().getOrInsertComputed(a, null), TypeError, 'non-callable#3');
  assert.throws(() => new WeakMap().getOrInsertComputed(a, undefined), TypeError, 'non-callable#4');
  assert.throws(() => new WeakMap().getOrInsertComputed(a), TypeError, 'non-callable#5');
  assert.throws(() => getOrInsertComputed.call({}, a, () => 3), TypeError, 'non-generic#1');
  assert.throws(() => getOrInsertComputed.call([], a, () => 3), TypeError, 'non-generic#2');
  assert.throws(() => getOrInsertComputed.call(undefined, a, () => 3), TypeError, 'non-generic#3');
  assert.throws(() => getOrInsertComputed.call(null, a, () => 3), TypeError, 'non-generic#4');
});
