import AsyncIterator from 'core-js-pure/features/async-iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#filter', assert => {
  assert.expect(8);
  const async = assert.async();
  const { filter } = AsyncIterator.prototype;

  assert.isFunction(filter);
  assert.arity(filter, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'filter');

  filter.call(createIterator([1, 2, 3]), it => it % 2).toArray().then(it => {
    assert.arrayEqual(it, [1, 3], 'basic functionality');
    async();
  });

  assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call([], () => { /* empty */ }), TypeError);
});
