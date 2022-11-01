import { createIterable, createIterator } from '../helpers/helpers';

QUnit.test('Iterator#toArray', assert => {
  const { toArray } = Iterator.prototype;

  assert.isFunction(toArray);
  assert.arity(toArray, 0);
  assert.name(toArray, 'toArray');
  assert.looksNative(toArray);
  assert.nonEnumerable(Iterator.prototype, 'toArray');

  assert.arrayEqual([1, 2, 3].values().toArray(), [1, 2, 3]);
  assert.arrayEqual(new Set([1, 2, 3]).values().toArray(), [1, 2, 3]);

  assert.arrayEqual(Iterator.from('123').toArray(), ['1', '2', '3']);
  assert.arrayEqual(Iterator.from(createIterable([1, 2, 3])).toArray(), [1, 2, 3]);

  assert.arrayEqual(toArray.call(createIterator([1, 2, 3])), [1, 2, 3]);

  assert.throws(() => toArray.call(undefined), TypeError);
  assert.throws(() => toArray.call(null), TypeError);
  assert.throws(() => toArray.call({}), TypeError);
  assert.throws(() => toArray.call([]), TypeError);
});
