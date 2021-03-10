import from from 'core-js-pure/full/array/from';
import range from 'core-js-pure/full/number/range';

QUnit.test('range', assert => {
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
    from(range(2 ** 53 - 1, 2 ** 53, { inclusive: true })),
    [9007199254740991, 9007199254740992],
  );
  assert.deepEqual(from(range(0, 0)), []);
  assert.deepEqual(from(range(0, -5, 1)), []);

  assert.deepEqual(from(range(NaN, 0)), []);
  assert.deepEqual(from(range(0, NaN)), []);
  assert.deepEqual(from(range(NaN, NaN)), []);
  assert.deepEqual(from(range(0, 0, { step: NaN })), []);
  assert.deepEqual(from(range(0, 5, NaN)), []);

  iterator = range(1, 3);
  assert.deepEqual(iterator.start, 1);
  assert.deepEqual(iterator.end, 3);
  assert.deepEqual(iterator.step, 1);
  assert.deepEqual(iterator.inclusive, false);

  iterator = range(-1, -3, { inclusive: true });
  assert.deepEqual(iterator.start, -1);
  assert.deepEqual(iterator.end, -3);
  assert.same(iterator.step, -1);
  assert.same(iterator.inclusive, true);

  iterator = range(-1, -3, { step: 4, inclusive() { /* empty */ } });
  assert.same(iterator.start, -1);
  assert.same(iterator.end, -3);
  assert.same(iterator.step, 4);
  assert.same(iterator.inclusive, true);

  iterator = range(0, 5);
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  assert.throws(() => Object.getOwnPropertyDescriptor(iterator, 'start').call({}), TypeError);

  assert.throws(() => range(Infinity, 10, 0), RangeError);
  assert.throws(() => range(-Infinity, 10, 0), RangeError);
  assert.throws(() => range(0, 10, Infinity), RangeError);
  assert.throws(() => range(0, 10, { step: Infinity }), RangeError);

  assert.throws(() => range({}, 1), TypeError);
  assert.throws(() => range(1, {}), TypeError);
});
