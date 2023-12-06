QUnit.test('Array#uniqueBy', assert => {
  const { uniqueBy } = Array.prototype;
  assert.isFunction(uniqueBy);
  assert.arity(uniqueBy, 1);
  assert.name(uniqueBy, 'uniqueBy');
  assert.looksNative(uniqueBy);
  assert.nonEnumerable(Array.prototype, 'uniqueBy');

  let array = [1, 2, 3, 2, 1];
  assert.notSame(array.uniqueBy(), array);
  assert.deepEqual(array.uniqueBy(), [1, 2, 3]);

  array = [
    {
      id: 1,
      uid: 10000,
    },
    {
      id: 2,
      uid: 10000,
    },
    {
      id: 3,
      uid: 10001,
    },
  ];

  assert.deepEqual(array.uniqueBy(it => it.uid), [
    {
      id: 1,
      uid: 10000,
    },
    {
      id: 3,
      uid: 10001,
    },
  ]);

  assert.deepEqual(array.uniqueBy(({ id, uid }) => `${ id }-${ uid }`), array);

  assert.deepEqual([1, undefined, 2, undefined, null, 1].uniqueBy(), [1, undefined, 2, null]);

  assert.deepEqual([0, -0].uniqueBy(), [0]);
  assert.deepEqual([NaN, NaN].uniqueBy(), [NaN]);

  assert.deepEqual(uniqueBy.call({ length: 1, 0: 1 }), [1]);

  assert.throws(() => uniqueBy.call(null), TypeError);
  assert.throws(() => uniqueBy.call(undefined), TypeError);

  assert.true('uniqueBy' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
