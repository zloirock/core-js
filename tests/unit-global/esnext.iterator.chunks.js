import { createIterator } from '../helpers/helpers.js';

const { from } = Array;

QUnit.test('Iterator#chunks', assert => {
  // eslint-disable-next-line es/no-nonstandard-iterator-prototype-properties -- required for testing
  const { chunks } = Iterator.prototype;

  assert.isFunction(chunks);
  assert.arity(chunks, 1);
  assert.name(chunks, 'chunks');
  assert.looksNative(chunks);
  assert.nonEnumerable(Iterator.prototype, 'chunks');

  assert.arrayEqual(from(chunks.call(createIterator([1, 2, 3]), 2)), [[1, 2], [3]], 'basic functionality');
});
