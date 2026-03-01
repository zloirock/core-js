import { createIterable, createIterator } from '../helpers/helpers.js';

const { assign } = Object;

QUnit.test('Iterator.from', assert => {
  const { from } = Iterator;

  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');
  assert.looksNative(from);
  assert.nonEnumerable(Iterator, 'from');

  assert.true(Iterator.from(createIterator([1, 2, 3])) instanceof Iterator, 'proxy, iterator');

  assert.true(Iterator.from(createIterable([1, 2, 3])) instanceof Iterator, 'proxy, iterable');

  assert.arrayEqual(Iterator.from(createIterable([1, 2, 3])).toArray(), [1, 2, 3], 'just a proxy');

  assert.throws(() => from(undefined), TypeError);
  assert.throws(() => from(null), TypeError);
  assert.throws(() => from({}).next(), TypeError);
  assert.throws(() => from(assign(new Iterator(), { next: 42 })).next(), TypeError);

  // Should not throw when an underlying iterator's `return` method is null
  // https://bugs.webkit.org/show_bug.cgi?id=288714
  const iterator = createIterator([], { return: null });
  const result = from(iterator).return('ignored');
  assert.true(result.done, 'iterator with null return #1');
  assert.strictEqual(result.value, undefined, 'iterator with null return #2');
});
