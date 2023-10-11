import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

import Iterator from '@core-js/pure/actual/iterator';

QUnit.test('Iterator#filter', assert => {
  const { filter } = Iterator.prototype;

  assert.isFunction(filter);
  assert.arity(filter, 1);
  assert.nonEnumerable(Iterator.prototype, 'filter');

  assert.arrayEqual(filter.call(createIterator([1, 2, 3]), it => it % 2).toArray(), [1, 3], 'basic functionality');
  filter.call(createIterator([1]), function (arg, counter) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
  }).toArray();

  if (STRICT) {
    assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => filter.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => filter.call({}, () => { /* empty */ }).next(), TypeError);
  assert.throws(() => filter.call([], () => { /* empty */ }).next(), TypeError);
  assert.throws(() => filter.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => filter.call(createIterator([1]), null), TypeError);
  assert.throws(() => filter.call(createIterator([1]), {}), TypeError);
});
