import { createIterator, createIterable } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

QUnit.test('Iterator#flatMap', assert => {
  const { flatMap } = Iterator.prototype;

  assert.isFunction(flatMap);
  assert.arity(flatMap, 1);
  assert.name(flatMap, 'flatMap');
  assert.looksNative(flatMap);
  assert.nonEnumerable(Iterator.prototype, 'flatMap');

  assert.arrayEqual(
    flatMap.call(createIterator([1, [], 2, createIterable([3, 4]), [5, 6]]), it => typeof it == 'number' ? [-it] : it).toArray(),
    [-1, -2, 3, 4, 5, 6],
    'basic functionality',
  );
  flatMap.call(createIterator([1]), function (arg, counter) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
    return [arg];
  }).toArray();

  if (STRICT) {
    assert.throws(() => flatMap.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => flatMap.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => flatMap.call({}, () => { /* empty */ }).next(), TypeError);
  assert.throws(() => flatMap.call([], () => { /* empty */ }).next(), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), it => it).next(), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), null), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), {}), TypeError);
});
