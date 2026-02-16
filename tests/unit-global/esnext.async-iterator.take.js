import { STRICT } from '../helpers/constants.js';
import { createIterator } from '../helpers/helpers.js';

QUnit.test('AsyncIterator#take', assert => {
  const { take } = AsyncIterator.prototype;

  assert.isFunction(take);
  assert.arity(take, 1);
  assert.name(take, 'take');
  assert.looksNative(take);
  assert.nonEnumerable(AsyncIterator.prototype, 'take');

  if (STRICT) {
    assert.throws(() => take.call(undefined, 1), TypeError);
    assert.throws(() => take.call(null, 1), TypeError);
  }

  assert.throws(() => take.call(createIterator([1, 2, 3]), -1), RangeError, 'negative');
  assert.throws(() => take.call(createIterator([1, 2, 3]), NaN), RangeError, 'NaN');

  return take.call(createIterator([1, 2, 3]), 2).toArray().then(it => {
    assert.arrayEqual(it, [1, 2], 'basic functionality');
    return take.call(createIterator([1, 2, 3]), 1.5).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1], 'float');
    return take.call(createIterator([1, 2, 3]), 4).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3], 'big');
    return take.call(createIterator([1, 2, 3]), 0).toArray();
  }).then(it => {
    assert.arrayEqual(it, [], 'zero');
  });
});

QUnit.test('AsyncIterator#take, return() result validated as object', assert => {
  assert.expect(1);
  const async = assert.async();

  const iter = {
    i: 0,
    next() { return { value: ++this.i, done: false }; },
    return() { return 42; },
    [Symbol.iterator]() { return this; },
  };

  AsyncIterator.from(iter).take(1).toArray().then(() => {
    assert.avoid();
    async();
  }).catch(error => {
    assert.true(error instanceof TypeError, 'rejects with TypeError when return() gives non-object');
    async();
  });
});
