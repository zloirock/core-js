/* eslint-disable no-extend-native -- Source-visible prototype writes are the subject of these tests. */
import { restoreProperty } from '../helpers/restore-property.cjs';
// Keep the literal-return wrapper: Babel's direct-array for-of lowering bypasses its iterator.
QUnit.test('iteration: an own iterator controls the yielded receiver family', assert => {
  const source = (() => [[1]])();
  let iteratorCalls = 0;
  let nextCalls = 0;
  source[Symbol.iterator] = function () {
    iteratorCalls++;
    let sent = false;
    return {
      next() {
        nextCalls++;
        if (sent) return { done: true };
        sent = true;
        return { value: 'text', done: false };
      },
    };
  };
  let result;
  for (const value of source) result = value.at(0);
  assert.same(result, 't');
  assert.same(iteratorCalls, 1);
  assert.same(nextCalls, 2);
});

QUnit.test('default presence: an inherited value outranks a missing own slot', assert => {
  const key = 'typedDefaultValue';
  const prior = Object.getOwnPropertyDescriptor(Object.prototype, key);
  let gets = 0;
  Object.defineProperty(Object.prototype, key, { configurable: true, get() {
    gets++;
    return 'xy';
  } });
  try {
    const { typedDefaultValue: value = [1] } = {};
    assert.true(value.includes('xy'));
    assert.same(gets, 1);
  } finally { restoreProperty(Object.prototype, key, prior); }
});

// Babel bypasses a literal array's iterator; that twin is locked in default-slot-presence.
// An iterable object keeps the same protocol/default oracle observable after lowering.
QUnit.test('default presence: iteration supplies a value before its default', assert => {
  const prior = Object.getOwnPropertyDescriptor(Array.prototype, Symbol.iterator);
  let iteratorCalls = 0;
  Array.prototype[Symbol.iterator] = function * () {
    iteratorCalls++;
    yield 'xy';
  };
  try {
    const [value = [1]] = { [Symbol.iterator]: Array.prototype[Symbol.iterator] };
    assert.true(value.includes('xy'));
    assert.same(iteratorCalls, 1);
  } finally { restoreProperty(Array.prototype, Symbol.iterator, prior); }
});
