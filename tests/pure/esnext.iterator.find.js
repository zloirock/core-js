import Iterator from 'core-js-pure/features/iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator#find', assert => {
  const { find } = Iterator.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  assert.nonEnumerable(Iterator.prototype, 'find');

  assert.same(find.call(createIterator([1, 2, 3]), it => !(it % 2)), 2, 'basic functionality');

  assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call([], () => { /* empty */ }), TypeError);
});
