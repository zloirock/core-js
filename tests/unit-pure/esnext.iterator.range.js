/* eslint-disable es/no-bigint -- safe */
import { MAX_SAFE_INTEGER } from '../helpers/constants.js';
import from from 'core-js-pure/es/array/from';
import range from 'core-js-pure/full/iterator/range';

QUnit.test('Iterator.range', assert => {
  assert.isFunction(range);
  assert.name(range, 'range');
  assert.arity(range, 3);

  let iterator = range(1, 2);

  assert.isIterator(iterator);
  assert.isIterable(iterator);
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

  iterator = range(0, 5, null);
  assert.same(iterator.start, 0, 'null option: start');
  assert.same(iterator.end, 5, 'null option: end');
  assert.same(iterator.step, 1, 'null option: step defaults to 1');
  assert.false(iterator.inclusive, 'null option: inclusive defaults to false');

  iterator = range(-1, -3, { step: 4, inclusive() { /* empty */ } });
  assert.same(iterator.start, -1);
  assert.same(iterator.end, -3);
  assert.same(iterator.step, 4);
  assert.true(iterator.inclusive);

  iterator = range(0, 5);
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  assert.throws(() => Object.getOwnPropertyDescriptor(iterator, 'start').get.call({}), TypeError);

  assert.throws(() => range(Infinity, 10, 0), RangeError);
  assert.throws(() => range(-Infinity, 10, 0), RangeError);
  assert.throws(() => range(0, 10, Infinity), RangeError);
  assert.throws(() => range(0, 10, { step: Infinity }), RangeError);

  assert.throws(() => range({}, 1), TypeError);
  assert.throws(() => range(1, {}), TypeError);
  assert.throws(() => range('1', 2), TypeError);
  assert.throws(() => range({ valueOf() { return 1; } }, 2), TypeError);

  if (typeof BigInt == 'function') {
    iterator = range(BigInt(1), BigInt(2));

    assert.isIterator(iterator);
    assert.isIterable(iterator);
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
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    assert.throws(() => Object.getOwnPropertyDescriptor(iterator, 'start').get.call({}), TypeError);

    assert.throws(() => range(Infinity, BigInt(10), BigInt(0)), TypeError);
    assert.throws(() => range(-Infinity, BigInt(10), BigInt(0)), TypeError);
    assert.throws(() => range(BigInt(0), BigInt(10), Infinity), TypeError);
    assert.throws(() => range(BigInt(0), BigInt(10), { step: Infinity }), TypeError);

    assert.throws(() => range({}, BigInt(1)), TypeError);
    assert.throws(() => range(BigInt(1), {}), TypeError);
  }
});
