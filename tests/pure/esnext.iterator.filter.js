import Iterator from 'core-js-pure/features/iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator#filter', assert => {
  const { filter } = Iterator.prototype;

  assert.isFunction(filter);
  assert.arity(filter, 1);
  assert.nonEnumerable(Iterator.prototype, 'filter');

  assert.arrayEqual(filter.call(createIterator([1, 2, 3]), it => it % 2).toArray(), [1, 3], 'basic functionality');

  assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call([], () => { /* empty */ }), TypeError);
});
