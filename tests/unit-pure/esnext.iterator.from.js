import { createIterable, createIterator } from '../helpers/helpers.js';

import Iterator from '@core-js/pure/actual/iterator';
import assign from '@core-js/pure/es/object/assign';

QUnit.test('Iterator.from', assert => {
  const { from } = Iterator;

  assert.isFunction(from);
  assert.arity(from, 1);

  assert.true(Iterator.from(createIterator([1, 2, 3])) instanceof Iterator, 'proxy, iterator');

  assert.true(Iterator.from(createIterable([1, 2, 3])) instanceof Iterator, 'proxy, iterable');

  assert.arrayEqual(Iterator.from(createIterable([1, 2, 3])).toArray(), [1, 2, 3], 'just a proxy');

  assert.throws(() => from(undefined), TypeError);
  assert.throws(() => from(null), TypeError);
  assert.throws(() => from({}).next(), TypeError);
  assert.throws(() => from(assign(new Iterator(), { next: 42 })).next(), TypeError);
});
