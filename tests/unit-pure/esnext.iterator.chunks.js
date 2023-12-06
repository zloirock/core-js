import { createIterator } from '../helpers/helpers.js';

import Iterator from '@core-js/pure/full/iterator';
import from from '@core-js/pure/es/array/from';

QUnit.test('Iterator#chunks', assert => {
  const { chunks } = Iterator.prototype;
  assert.isFunction(chunks);
  assert.arity(chunks, 1);
  assert.name(chunks, 'chunks');
  assert.nonEnumerable(Iterator.prototype, 'chunks');

  assert.arrayEqual(from(chunks.call(createIterator([1, 2, 3]), 2)), [[1, 2], [3]], 'basic functionality #1');
  assert.arrayEqual(from(chunks.call(createIterator([1, 2, 3, 4]), 2)), [[1, 2], [3, 4]], 'basic functionality #2');
  assert.arrayEqual(from(chunks.call(createIterator([]), 2)), [], 'basic functionality on empty iterable');

  const it = createIterator([1, 2, 3]);
  const result = chunks.call(it, 3);
  assert.isIterable(result, 'returns iterable');
  assert.isIterator(result, 'returns iterator');
  assert.true(result instanceof Iterator, 'returns iterator');
  assert.deepEqual(result.next(), { done: false, value: [1, 2, 3] }, '.next with active inner iterator result');
  assert.deepEqual(result.return(), { done: true, value: undefined }, '.return with active inner iterator result');
  assert.deepEqual(result.next(), { done: true, value: undefined }, '.return with active inner iterator result on closed iterator');

  assert.throws(() => chunks.call('', 1), TypeError, 'iterable non-object this');
  assert.throws(() => chunks.call(undefined, 1), TypeError, 'non-iterable-object this #1');
  assert.throws(() => chunks.call(null, 1), TypeError, 'non-iterable-object this #2');
  assert.throws(() => chunks.call(5, 1), TypeError, 'non-iterable-object this #3');

  assert.throws(() => chunks.call(it), RangeError, 'throws on empty argument');
  assert.throws(() => chunks.call(it, -1), RangeError, 'throws on negative argument');

  const observableReturn = {
    return() {
      this.called = true;
      return { done: true, value: undefined };
    },
  };
  const itObservable = createIterator([1, 2, 3], observableReturn);
  assert.throws(() => chunks.call(itObservable, 0x100000000), RangeError, 'throws on argument more then 2^32 - 1');
  assert.true(itObservable.called, 'iterator closed on argument validation error');
});
