QUnit.test('Object.iterateValues', assert => {
  const { iterateValues } = Object;
  assert.isFunction(iterateValues);
  assert.name(iterateValues, 'iterateValues');
  assert.arity(iterateValues, 1);
  assert.looksNative(iterateValues);
  assert.nonEnumerable(Object, 'iterateValues');

  const object = {
    q: 1,
    w: 2,
    e: 3,
  };
  const iterator = iterateValues(object);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Object Iterator');
  assert.deepEqual(iterator.next(), {
    value: 1,
    done: false,
  });
  delete object.w;
  assert.deepEqual(iterator.next(), {
    value: 3,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});
