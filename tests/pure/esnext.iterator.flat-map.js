import Iterator from 'core-js-pure/full/iterator';

import { createIterator, createIterable } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('Iterator#flatMap', assert => {
  const { flatMap } = Iterator.prototype;

  assert.isFunction(flatMap);
  assert.arity(flatMap, 1);
  assert.nonEnumerable(Iterator.prototype, 'flatMap');

  assert.arrayEqual(
    flatMap.call(createIterator([1, [], 2, createIterable([3, 4]), [5, 6], 'ab']), it => typeof it == 'number' ? [-it] : it).toArray(),
    [-1, -2, 3, 4, 5, 6, 'a', 'b'],
    'basic functionality',
  );
  flatMap.call(createIterator([1]), function (arg) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 1, 'arguments length');
    assert.same(arg, 1, 'argument');
    return [arg];
  }).toArray();

  assert.throws(() => flatMap.call(createIterator([1]), it => it).next(), TypeError);
  assert.throws(() => flatMap.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), null), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), {}), TypeError);
});
