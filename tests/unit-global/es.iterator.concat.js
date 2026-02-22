import { createIterable, createIterator } from '../helpers/helpers.js';

const { from } = Array;

QUnit.test('Iterator.concat', assert => {
  const { concat } = Iterator;

  assert.isFunction(concat);
  assert.arity(concat, 0);
  assert.name(concat, 'concat');
  assert.looksNative(concat);
  assert.nonEnumerable(Iterator, 'concat');

  let iterator = concat();
  assert.isIterable(iterator, 'iterable, no args');
  assert.isIterator(iterator, 'iterator, no args');
  assert.true(iterator instanceof Iterator, 'iterator instance, no args');
  assert.arrayEqual(from(iterator), [], 'proper values, no args');

  iterator = concat([1, 2, 3]);
  assert.isIterable(iterator, 'iterable, array');
  assert.isIterator(iterator, 'iterator, array');
  assert.true(iterator instanceof Iterator, 'iterator instance, array');
  assert.arrayEqual(from(iterator), [1, 2, 3], 'proper values, array');

  iterator = concat([]);
  assert.isIterable(iterator, 'iterable, empty array');
  assert.isIterator(iterator, 'iterator, empty array');
  assert.true(iterator instanceof Iterator, 'iterator instance, empty array');
  assert.arrayEqual(from(iterator), [], 'proper values, empty array');

  iterator = concat(createIterable([1, 2, 3]));
  assert.isIterable(iterator, 'iterable, custom iterable');
  assert.isIterator(iterator, 'iterator, custom iterable');
  assert.true(iterator instanceof Iterator, 'iterator instance, custom iterable');
  assert.arrayEqual(from(iterator), [1, 2, 3], 'proper values, custom iterable');

  iterator = concat([1, 2, 3], [], createIterable([4, 5, 6]), createIterable([]));
  assert.isIterable(iterator, 'iterable, mixed');
  assert.isIterator(iterator, 'iterator, mixed');
  assert.true(iterator instanceof Iterator, 'iterator instance, mixed');
  assert.arrayEqual(from(iterator), [1, 2, 3, 4, 5, 6], 'proper values, mixed');

  iterator = concat(createIterable([1, 2, 3]));
  assert.deepEqual(iterator.return(), { done: true, value: undefined }, '.return with no active inner iterator result');
  assert.deepEqual(iterator.next(), { done: true, value: undefined }, '.return with no active inner iterator result on closed iterator');

  iterator = concat(createIterable([1, 2, 3]));
  assert.deepEqual(iterator.next(), { done: false, value: 1 }, '.next with active inner iterator result');
  assert.deepEqual(iterator.return(), { done: true, value: undefined }, '.return with active inner iterator result');
  assert.deepEqual(iterator.next(), { done: true, value: undefined }, '.return with active inner iterator result on closed iterator');

  let called = false;
  iterator = concat(createIterable([1, 2, 3], {
    return() {
      called = true;
      return {};
    },
  }));
  iterator.next();
  assert.deepEqual(iterator.return(), { done: true, value: undefined }, '.return with active inner iterator with return result');
  assert.true(called, 'inner .return called');

  // https://github.com/tc39/proposal-iterator-sequencing/issues/17
  const oldIterResult = {
    done: false,
    value: 123,
  };
  const testIterator = {
    next() {
      return oldIterResult;
    },
  };
  const iterable = {
    [Symbol.iterator]() {
      return testIterator;
    },
  };
  iterator = concat(iterable);
  const iterResult = iterator.next();
  assert.same(iterResult.done, false);
  assert.same(iterResult.value, 123);
  // https://github.com/tc39/proposal-iterator-sequencing/pull/26
  assert.notSame(iterResult, oldIterResult);

  assert.throws(() => concat(createIterator([1, 2, 3])), TypeError, 'non-iterable iterator #1');
  assert.throws(() => concat([], createIterator([1, 2, 3])), TypeError, 'non-iterable iterator #2');
  assert.throws(() => concat(''), TypeError, 'iterable non-object argument #1');
  assert.throws(() => concat([], ''), TypeError, 'iterable non-object argument #2');
  assert.throws(() => concat(undefined), TypeError, 'non-iterable-object argument #1');
  assert.throws(() => concat(null), TypeError, 'non-iterable-object argument #2');
  assert.throws(() => concat(1), TypeError, 'non-iterable-object argument #3');
  assert.throws(() => concat({}), TypeError, 'non-iterable-object argument #4');
  assert.throws(() => concat([], undefined), TypeError, 'non-iterable-object argument #5');
  assert.throws(() => concat([], null), TypeError, 'non-iterable-object argument #6');
  assert.throws(() => concat([], 1), TypeError, 'non-iterable-object argument #7');
  assert.throws(() => concat([], {}), TypeError, 'non-iterable-object argument #8');
});
