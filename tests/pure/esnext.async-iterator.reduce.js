import AsyncIterator from 'core-js-pure/full/async-iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#reduce', assert => {
  assert.expect(18);
  const async = assert.async();
  const { reduce } = AsyncIterator.prototype;

  assert.isFunction(reduce);
  assert.arity(reduce, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'reduce');

  reduce.call(createIterator([1, 2, 3]), (a, b) => a + b, 1).then(it => {
    assert.same(it, 7, 'basic functionality, initial');
    return reduce.call(createIterator([2]), function (a, b) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(a, 1, 'argument 1');
      assert.same(b, 2, 'argument 2');
    }, 1);
  }).then(() => {
    return reduce.call(createIterator([1, 2, 3]), (a, b) => a + b);
  }).then(it => {
    assert.same(it, 6, 'basic functionality, no initial');
    return reduce.call(createIterator([]), (a, b) => a + b);
  }).catch(() => {
    assert.ok(true, 'reduce an empty interble with no initial');
    return reduce.call(createIterator([1]), () => { throw 42; }, 1);
  }).catch(error => {
    assert.same(error, 42, 'rejection on a callback error');
  }).then(() => async());

  assert.throws(() => reduce.call(undefined, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call(null, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call({}, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call([], () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), undefined, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), null, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), {}, 1), TypeError);
});
