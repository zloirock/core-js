QUnit.test('Array#map', assert => {
  const { map } = Array.prototype;
  assert.isFunction(map);
  assert.arity(map, 1);
  assert.name(map, 'map');
  assert.looksNative(map);
  assert.nonEnumerable(Array.prototype, 'map');
  let array = [1];
  const context = {};
  array.map(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([2, 3, 4], [1, 2, 3].map(value => value + 1));
  assert.deepEqual([1, 3, 5], [1, 2, 3].map((value, key) => value + key));
  assert.deepEqual([2, 2, 2], [1, 2, 3].map(function () {
    return +this;
  }, 2));

  assert.throws(() => map.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call(undefined, () => { /* empty */ }), TypeError);

  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
  assert.same(array.map(Boolean).foo, 1, '@@species');
});
