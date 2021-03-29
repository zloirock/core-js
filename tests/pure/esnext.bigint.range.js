/* eslint-disable es/no-bigint -- safe */
import from from 'core-js-pure/full/array/from';
import range from 'core-js-pure/full/bigint/range';

if (typeof BigInt == 'function') QUnit.test('BigInt.range', assert => {
  assert.isFunction(range);
  assert.name(range, 'range');
  assert.arity(range, 3);

  let iterator = range(BigInt(1), BigInt(2));

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
  assert.deepEqual(iterator.inclusive, false);

  iterator = range(BigInt(-1), BigInt(-3), { inclusive: true });
  assert.deepEqual(iterator.start, BigInt(-1));
  assert.deepEqual(iterator.end, BigInt(-3));
  assert.same(iterator.step, BigInt(-1));
  assert.same(iterator.inclusive, true);

  iterator = range(BigInt(-1), BigInt(-3), { step: BigInt(4), inclusive() { /* empty */ } });
  assert.same(iterator.start, BigInt(-1));
  assert.same(iterator.end, BigInt(-3));
  assert.same(iterator.step, BigInt(4));
  assert.same(iterator.inclusive, true);

  iterator = range(BigInt(0), BigInt(5));
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  assert.throws(() => Object.getOwnPropertyDescriptor(iterator, 'start').call({}), TypeError);

  assert.throws(() => range(Infinity, BigInt(10), BigInt(0)), TypeError);
  assert.throws(() => range(-Infinity, BigInt(10), BigInt(0)), TypeError);
  assert.throws(() => range(BigInt(0), BigInt(10), Infinity), TypeError);
  assert.throws(() => range(BigInt(0), BigInt(10), { step: Infinity }), TypeError);

  assert.throws(() => range({}, BigInt(1)), TypeError);
  assert.throws(() => range(BigInt(1), {}), TypeError);
});
