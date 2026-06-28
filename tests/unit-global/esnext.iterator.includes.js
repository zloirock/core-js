import { STRICT } from '../helpers/constants.js';
import { createIterator } from '../helpers/helpers.js';

QUnit.test('Iterator#includes', assert => {
  const { includes } = Iterator.prototype;

  assert.isFunction(includes);
  assert.arity(includes, 1);
  assert.name(includes, 'includes');
  assert.looksNative(includes);
  assert.nonEnumerable(Iterator.prototype, 'includes');

  assert.true(includes.call(createIterator([1, 2, 3]), 2), 'basic functionality #1');
  assert.false(includes.call(createIterator([1, 2, 3]), 4), 'basic functionality #2');
  assert.true(includes.call(createIterator([1, 'foo', 3]), 'foo'), 'basic functionality #3');
  assert.false(includes.call(createIterator([]), 1), 'empty iterator');

  // SameValueZero semantics
  assert.true(includes.call(createIterator([NaN]), NaN), 'NaN is found');
  assert.true(includes.call(createIterator([0]), -0), '+0 and -0 are equal #1');
  assert.true(includes.call(createIterator([-0]), 0), '+0 and -0 are equal #2');
  assert.false(includes.call(createIterator([undefined]), null), 'undefined is not null');

  // skippedElements parameter - valid values
  assert.true(includes.call(createIterator([1, 2, 3]), 3, 2), 'skippedElements #1');
  assert.false(includes.call(createIterator([1, 2, 3]), 1, 1), 'skippedElements #2');
  assert.true(includes.call(createIterator([1, 2, 3]), 1, 0), 'skippedElements 0');
  assert.true(includes.call(createIterator([1, 2, 3]), 1, -0), 'skippedElements -0');
  assert.true(includes.call(createIterator([1, 2, 3]), 1, undefined), 'skippedElements undefined');
  assert.true(includes.call(createIterator([1, 2, 3, 2]), 2, 2), 'skippedElements finds later occurrence');
  assert.false(includes.call(createIterator([1, 2, 3]), 2, 3), 'skippedElements skips all');

  assert.throws(() => includes.call(createIterator([1]), 1, 1.5), TypeError, 'non-integer number');
  assert.throws(() => includes.call(createIterator([1]), 1, NaN), TypeError, 'NaN');
  assert.throws(() => includes.call(createIterator([1]), 1, '1'), TypeError, 'string');
  assert.throws(() => includes.call(createIterator([1]), 1, true), TypeError, 'boolean');
  assert.throws(() => includes.call(createIterator([1]), 1, null), TypeError, 'null');
  assert.throws(() => includes.call(createIterator([1]), 1, {}), TypeError, 'object');

  assert.throws(() => includes.call(createIterator([1, 2, 3]), 1, Infinity), RangeError, 'skippedElements Infinity');
  assert.throws(() => includes.call(createIterator([1]), 1, -Infinity), RangeError, 'negative Infinity');
  assert.throws(() => includes.call(createIterator([1]), 1, -1), RangeError, 'negative integer');
  assert.throws(() => includes.call(createIterator([1]), 1, 0x20000000000000), RangeError, 'unsafe integer');

  // iterator closing on match
  const it1 = createIterator([1, 2, 3], {
    return() {
      this.closed = true;
      return { done: true, value: undefined };
    },
  });
  assert.true(includes.call(it1, 2), 'found element');
  assert.true(it1.closed, 'iterator closes on match');

  // iterator closing on skippedElements validation error
  const it2 = createIterator([1, 2, 3], { return() { this.closed = true; } });
  assert.throws(() => includes.call(it2, 1, -1), RangeError, 'negative skippedElements');
  assert.true(it2.closed, 'iterator closes on negative skippedElements');

  const it3 = createIterator([1, 2, 3], { return() { this.closed = true; } });
  assert.throws(() => includes.call(it3, 1, 1.5), TypeError, 'non-integer skippedElements');
  assert.true(it3.closed, 'iterator closes on non-integer skippedElements');

  if (STRICT) {
    assert.throws(() => includes.call(undefined, 1), TypeError, 'non-object this #1');
    assert.throws(() => includes.call(null, 1), TypeError, 'non-object this #2');
  }
});
