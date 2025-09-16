import { STRICT } from '../helpers/constants.js';
import { createIterator } from '../helpers/helpers.js';

const { from } = Array;

QUnit.test('Iterator#windows', assert => {
  const { windows } = Iterator.prototype;

  assert.isFunction(windows);
  assert.arity(windows, 1);
  assert.name(windows, 'windows');
  assert.looksNative(windows);
  assert.nonEnumerable(Iterator.prototype, 'windows');

  assert.arrayEqual(from(windows.call(createIterator([1, 2, 3]), 2)), [[1, 2], [2, 3]], 'basic functionality #1');
  assert.arrayEqual(from(windows.call(createIterator([1, 2, 3, 4]), 2)), [[1, 2], [2, 3], [3, 4]], 'basic functionality #2');
  assert.arrayEqual(from(windows.call(createIterator([1, 2]), 3)), [], 'basic functionality #3');
  assert.arrayEqual(from(windows.call(createIterator([]), 2)), [], 'basic functionality on empty iterable');

  assert.arrayEqual(from(windows.call(createIterator([1, 2]), 3, 'only-full')), [], 'undersized #1');
  assert.arrayEqual(from(windows.call(createIterator([1, 2]), 3, 'allow-partial')), [[1, 2]], 'undersized #2');

  const it = createIterator([1, 2, 3]);
  const result = windows.call(it, 3);
  assert.isIterable(result, 'returns iterable');
  assert.isIterator(result, 'returns iterator');
  assert.true(result instanceof Iterator, 'returns iterator');
  assert.deepEqual(result.next(), { done: false, value: [1, 2, 3] }, '.next with active inner iterator result');
  assert.deepEqual(result.return(), { done: true, value: undefined }, '.return with active inner iterator result');
  assert.deepEqual(result.next(), { done: true, value: undefined }, '.return with active inner iterator result on closed iterator');

  if (STRICT) {
    assert.throws(() => windows.call('', 1), TypeError, 'iterable non-object this');
    assert.throws(() => windows.call(undefined, 1), TypeError, 'non-iterable-object this #1');
    assert.throws(() => windows.call(null, 1), TypeError, 'non-iterable-object this #2');
    assert.throws(() => windows.call(5, 1), TypeError, 'non-iterable-object this #3');
  }

  assert.throws(() => windows.call(it), RangeError, 'throws on empty argument');
  assert.throws(() => windows.call(it, -1), RangeError, 'throws on negative argument');

  const observableReturn = {
    return() {
      this.called = true;
      return { done: true, value: undefined };
    },
  };
  const itObservable = createIterator([1, 2, 3], observableReturn);
  assert.throws(() => windows.call(itObservable, 0x100000000), RangeError, 'throws on argument more then 2^32 - 1');
  assert.true(itObservable.called, 'iterator closed on argument validation error');

  assert.throws(() => windows.call(createIterator([1]), 2, null), TypeError, 'incorrect `undersized` argument #1');
  assert.throws(() => windows.call(createIterator([1]), 2, 'allowpartial'), TypeError, 'incorrect `undersized` argument #2');
});
