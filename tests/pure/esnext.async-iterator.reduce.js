import AsyncIterator from 'core-js-pure/features/async-iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#reduce', assert => {
  assert.expect(15);
  const async = assert.async();
  const { reduce } = AsyncIterator.prototype;

  assert.isFunction(reduce);
  assert.arity(reduce, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'reduce');

  reduce.call(createIterator([1, 2, 3]), (a, b) => a + b, 1).then(it => {
    assert.same(it, 7, 'basic functionality');
    return reduce.call(createIterator([2]), function (a, b) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(a, 1, 'argument 1');
      assert.same(b, 2, 'argument 2');
    }, 1);
  }).then(() => async());

  assert.throws(() => reduce.call(undefined, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call(null, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call({}, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call([], () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), undefined, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), null, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), {}, 1), TypeError);
});
