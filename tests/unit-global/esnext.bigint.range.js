/* eslint-disable es/no-bigint -- safe */
import { DESCRIPTORS, STRICT } from '../helpers/constants.js';

if (typeof BigInt == 'function') QUnit.test('BigInt.range', assert => {
  const { range } = BigInt;
  const { from } = Array;
  assert.isFunction(range);
  assert.name(range, 'range');
  assert.arity(range, 3);
  assert.looksNative(range);
  assert.nonEnumerable(BigInt, 'range');

  let iterator = range(BigInt(1), BigInt(2));

  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[Symbol.toStringTag], 'NumericRangeIterator');
  assert.same(String(iterator), '[object NumericRangeIterator]');
  assert.deepEqual(iterator.next(), {
    value: BigInt(1),
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });

  assert.deepEqual(from(range(BigInt(-1), BigInt(5))), [BigInt(-1), BigInt(0), BigInt(1), BigInt(2), BigInt(3), BigInt(4)]);
  assert.deepEqual(from(range(BigInt(-5), BigInt(1))), [BigInt(-5), BigInt(-4), BigInt(-3), BigInt(-2), BigInt(-1), BigInt(0)]);
  assert.deepEqual(
    from(range(BigInt('9007199254740991'), BigInt('9007199254740992'), { inclusive: true })),
    [BigInt('9007199254740991'), BigInt('9007199254740992')],
  );
  assert.deepEqual(from(range(BigInt(0), BigInt(0))), []);
  assert.deepEqual(from(range(BigInt(0), BigInt(-5), BigInt(1))), []);

  for (const start of [BigInt(2), BigInt(-2), BigInt(0)]) {
    for (const step of [BigInt(-1), BigInt(0), BigInt(1)]) for (const inclusive of [false, true]) {
      const equalIterator = range(start, start, { step, inclusive });
      assert.deepEqual(equalIterator.next(), { value: inclusive ? start : undefined, done: !inclusive }, 'equal BigInt bounds');
      assert.deepEqual(equalIterator.next(), { value: undefined, done: true }, 'equal BigInt bounds terminate');
    }
  }
  assert.throws(() => range(BigInt(0), BigInt(10), { step: NaN }), RangeError, 'NaN step option is checked before its type');
  assert.throws(() => range(BigInt(0), BigInt(10), NaN), TypeError, 'numeric step argument is invalid for a BigInt range');
  for (const end of [Infinity, -Infinity]) {
    const unboundedIterator = range(BigInt(0), end);
    assert.deepEqual(unboundedIterator.next(), { value: BigInt(0), done: false });
    assert.deepEqual(unboundedIterator.next(), { value: end > 0 ? BigInt(1) : BigInt(-1), done: false });
  }

  iterator = range(BigInt(1), BigInt(3));
  assert.deepEqual(iterator.start, BigInt(1));
  assert.deepEqual(iterator.end, BigInt(3));
  assert.deepEqual(iterator.step, BigInt(1));
  assert.false(iterator.inclusive);

  iterator = range(BigInt(-1), BigInt(-3), { inclusive: true });
  assert.deepEqual(iterator.start, BigInt(-1));
  assert.deepEqual(iterator.end, BigInt(-3));
  assert.same(iterator.step, BigInt(-1));
  assert.true(iterator.inclusive);

  iterator = range(BigInt(-1), BigInt(-3), { step: BigInt(4), inclusive() { /* empty */ } });
  assert.same(iterator.start, BigInt(-1));
  assert.same(iterator.end, BigInt(-3));
  assert.same(iterator.step, BigInt(4));
  assert.true(iterator.inclusive);

  iterator = range(BigInt(0), BigInt(5));
  if (DESCRIPTORS) for (const key of ['start', 'end', 'step', 'inclusive']) {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(iterator), key);
    assert.isFunction(descriptor.get, key);
    assert.same(descriptor.set, undefined, `${ key } has no setter`);
    assert.false(descriptor.enumerable, key);
    assert.true(descriptor.configurable, key);
    assert.throws(() => descriptor.get.call({}), TypeError, `${ key } checks its receiver`);
  }
  // IE11 does not throw on computed-key assignment to getter-only properties.
  if (DESCRIPTORS && STRICT) {
    assert.throws(() => { iterator.start = 42; }, TypeError, 'start is read-only');
    assert.throws(() => { iterator.end = 42; }, TypeError, 'end is read-only');
    assert.throws(() => { iterator.step = 42; }, TypeError, 'step is read-only');
    assert.throws(() => { iterator.inclusive = 42; }, TypeError, 'inclusive is read-only');
  }

  assert.throws(() => range(Infinity, BigInt(10), BigInt(0)), TypeError);
  assert.throws(() => range(-Infinity, BigInt(10), BigInt(0)), TypeError);
  assert.throws(() => range(BigInt(0), BigInt(10), Infinity), TypeError);
  assert.throws(() => range(BigInt(0), BigInt(10), { step: Infinity }), TypeError);

  assert.throws(() => range({}, BigInt(1)), TypeError);
  assert.throws(() => range(BigInt(1), {}), error => error instanceof TypeError && error.message === 'Incorrect range arguments');
  assert.throws(() => range(BigInt(1), BigInt(2), BigInt(0)), error => error instanceof RangeError && error.message === 'Incorrect range arguments');
});
