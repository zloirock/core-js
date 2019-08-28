import Iterator from 'core-js-pure/features/iterator';

import { createIterator, createIterable } from '../helpers/helpers';

QUnit.test('Iterator#flatMap', assert => {
  const { flatMap } = Iterator.prototype;

  assert.isFunction(flatMap);
  assert.arity(flatMap, 1);
  assert.nonEnumerable(Iterator.prototype, 'flatMap');

  assert.arrayEqual(
    flatMap.call(createIterator([1, [], 2, createIterable([3, 4]), [5, 6], 'ab']), it => typeof it == 'number' ? -it : it).toArray(),
    [-1, -2, 3, 4, 5, 6, 'ab'],
    'basic functionality'
  );

  assert.throws(() => flatMap.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call([], () => { /* empty */ }), TypeError);
});
