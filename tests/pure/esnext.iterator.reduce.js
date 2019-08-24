import Iterator from 'core-js-pure/features/iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator#reduce', assert => {
  const { reduce } = Iterator.prototype;

  assert.isFunction(reduce);
  assert.arity(reduce, 1);
  assert.nonEnumerable(Iterator.prototype, 'reduce');

  assert.same(reduce.call(createIterator([1, 2, 3]), (a, b) => a + b, 1), 7, 'basic functionality');
  assert.same(reduce.call(createIterator([1, 2, 3]), (a, b) => a + b), 6, 'basic functionality, no init');

  assert.throws(() => reduce.call(undefined, (a, b) => a + b, 0), TypeError);
  assert.throws(() => reduce.call(null, (a, b) => a + b, 0), TypeError);
  assert.throws(() => reduce.call({}, (a, b) => a + b, 0), TypeError);
  assert.throws(() => reduce.call([], (a, b) => a + b, 0), TypeError);
});
