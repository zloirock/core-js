import Iterator from 'core-js-pure/full/iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('Iterator#reduce', assert => {
  const { reduce } = Iterator.prototype;

  assert.isFunction(reduce);
  assert.arity(reduce, 1);
  assert.nonEnumerable(Iterator.prototype, 'reduce');

  assert.same(reduce.call(createIterator([1, 2, 3]), (a, b) => a + b, 1), 7, 'basic functionality');
  assert.same(reduce.call(createIterator([1, 2, 3]), (a, b) => a + b), 6, 'basic functionality, no init');
  reduce.call(createIterator([2]), function (a, b) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(a, 1, 'argument 1');
    assert.same(b, 2, 'argument 2');
  }, 1);

  assert.throws(() => reduce.call(undefined, (a, b) => a + b, 0), TypeError);
  assert.throws(() => reduce.call(null, (a, b) => a + b, 0), TypeError);
  assert.throws(() => reduce.call({}, (a, b) => a + b, 0), TypeError);
  assert.throws(() => reduce.call([], (a, b) => a + b, 0), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), undefined, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), null, 1), TypeError);
  assert.throws(() => reduce.call(createIterator([1]), {}, 1), TypeError);
});
