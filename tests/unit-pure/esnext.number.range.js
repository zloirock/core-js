import { DESCRIPTORS, MAX_SAFE_INTEGER, STRICT } from '../helpers/constants.js';
import from from 'core-js-pure/es/array/from';
import range from 'core-js-pure/full/number/range';
import getOwnPropertyDescriptor from 'core-js-pure/es/object/get-own-property-descriptor';
import getPrototypeOf from 'core-js-pure/es/object/get-prototype-of';
import TO_STRING_TAG from 'core-js-pure/es/symbol/to-string-tag';

QUnit.test('Number.range', assert => {
  assert.isFunction(range);
  assert.name(range, 'range');
  assert.arity(range, 3);

  let iterator = range(1, 2);

  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[TO_STRING_TAG], 'NumericRangeIterator');
  assert.same(String(iterator), '[object NumericRangeIterator]');
  assert.deepEqual(iterator.next(), {
    value: 1,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });

  assert.deepEqual(from(range(-1, 5)), [-1, 0, 1, 2, 3, 4]);
  assert.deepEqual(from(range(-5, 1)), [-5, -4, -3, -2, -1, 0]);
  assert.deepEqual(
    from(range(0, 1, 0.1)),
    [0, 0.1, 0.2, 0.30000000000000004, 0.4, 0.5, 0.6000000000000001, 0.7000000000000001, 0.8, 0.9],
  );
  assert.deepEqual(
    from(range(MAX_SAFE_INTEGER, MAX_SAFE_INTEGER + 1, { inclusive: true })),
    [MAX_SAFE_INTEGER, MAX_SAFE_INTEGER + 1],
  );
  assert.deepEqual(from(range(0, 0)), []);
  assert.deepEqual(from(range(0, -5, 1)), []);

  for (const start of [2, -2]) for (const step of [-1, 0, 1]) for (const inclusive of [false, true]) {
    const equalIterator = range(start, start, { step, inclusive });
    assert.deepEqual(equalIterator.next(), { value: inclusive ? start : undefined, done: !inclusive }, 'equal bounds');
    assert.deepEqual(equalIterator.next(), { value: undefined, done: true }, 'equal bounds terminate');
  }
  for (const start of [0, -0]) for (const step of [-1, -0, 0, 1]) {
    const zeroIterator = range(start, start, { step, inclusive: true });
    const result = zeroIterator.next();
    assert.false(result.done, 'inclusive zero range yields once');
    assert.same(1 / result.value, 1 / start, 'preserves the sign of the initial zero');
    assert.true(zeroIterator.next().done, 'zero range terminates');
  }
  assert.throws(() => range(2, 1, -0), RangeError, 'negative zero step with different bounds');

  for (const direction of [1, -1]) for (const inclusive of [false, true]) {
    const unboundedIterator = range(0, direction * Infinity, { step: direction * Number.MAX_VALUE, inclusive });
    assert.deepEqual(unboundedIterator.next(), { value: 0, done: false });
    assert.deepEqual(unboundedIterator.next(), { value: direction * Number.MAX_VALUE, done: false });
    assert.deepEqual(unboundedIterator.next(), { value: direction * Infinity, done: false }, 'yields the infinite endpoint');
    assert.deepEqual(unboundedIterator.next(), { value: undefined, done: true });
  }

  assert.throws(() => range(NaN, 0), RangeError, 'NaN as start');
  assert.throws(() => range(0, NaN), RangeError, 'NaN as end');
  assert.throws(() => range(NaN, NaN), RangeError, 'NaN as start and end');
  assert.throws(() => range(0, 0, { step: NaN }), RangeError, 'NaN as step option');
  assert.throws(() => range(0, 5, NaN), RangeError, 'NaN as step argument');

  iterator = range(1, 3);
  assert.deepEqual(iterator.start, 1);
  assert.deepEqual(iterator.end, 3);
  assert.deepEqual(iterator.step, 1);
  assert.false(iterator.inclusive);

  iterator = range(-1, -3, { inclusive: true });
  assert.deepEqual(iterator.start, -1);
  assert.deepEqual(iterator.end, -3);
  assert.same(iterator.step, -1);
  assert.true(iterator.inclusive);

  iterator = range(-1, -3, { step: 4, inclusive() { /* empty */ } });
  assert.same(iterator.start, -1);
  assert.same(iterator.end, -3);
  assert.same(iterator.step, 4);
  assert.true(iterator.inclusive);

  iterator = range(0, 5);
  if (DESCRIPTORS) for (const key of ['start', 'end', 'step', 'inclusive']) {
    const descriptor = getOwnPropertyDescriptor(getPrototypeOf(iterator), key);
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

  assert.throws(() => range(Infinity, 10, 0), RangeError);
  assert.throws(() => range(-Infinity, 10, 0), RangeError);
  assert.throws(() => range(0, 10, Infinity), RangeError);
  assert.throws(() => range(0, 10, { step: Infinity }), RangeError);

  assert.throws(() => range({}, 1), TypeError);
  assert.throws(() => range(1, {}), error => error instanceof TypeError && error.message === 'Incorrect range arguments');
  assert.throws(() => range(1, 2, 0), error => error instanceof RangeError && error.message === 'Incorrect range arguments');
});
