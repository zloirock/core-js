import { createIterator } from '../helpers/helpers.js';

QUnit.test('AsyncIterator#reduce', assert => {
  const { reduce } = AsyncIterator.prototype;

  assert.isFunction(reduce);
  assert.arity(reduce, 1);
  assert.name(reduce, 'reduce');
  assert.looksNative(reduce);
  assert.nonEnumerable(AsyncIterator.prototype, 'reduce');

  assert.throws(() => reduce.call(undefined, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call(null, () => { /* empty */ }, 1), TypeError);

  assert.throws(() => reduce.call(createIterator([1]), undefined, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), null, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), {}, 1), TypeError);

  return reduce.call(createIterator([1, 2, 3]), (a, b) => a + b, 1).then(it => {
    assert.same(it, 7, 'basic functionality, initial');
    return reduce.call(createIterator([2]), function (a, b, counter) {
      assert.same(this, undefined, 'this');
      assert.same(arguments.length, 3, 'arguments length');
      assert.same(a, 1, 'argument 1');
      assert.same(b, 2, 'argument 2');
      assert.same(counter, 0, 'counter');
    }, 1);
  }).then(() => {
    return reduce.call(createIterator([1, 2, 3]), (a, b) => a + b);
  }).then(it => {
    assert.same(it, 6, 'basic functionality, no initial');
    return reduce.call(createIterator([]), (a, b) => a + b);
  }).catch(() => {
    assert.required('reduce an empty iterable with no initial');
    return reduce.call(createIterator([1]), () => { throw 42; }, 1);
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
  });
});
