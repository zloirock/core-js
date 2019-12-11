QUnit.test('Object.iterateKeys', assert => {
  const { iterateKeys } = Object;
  assert.isFunction(iterateKeys);
  assert.name(iterateKeys, 'iterateKeys');
  assert.arity(iterateKeys, 1);
  assert.looksNative(iterateKeys);
  assert.nonEnumerable(Object, 'iterateKeys');

  const object = {
    q: 1,
    w: 2,
    e: 3,
  };
  const iterator = iterateKeys(object);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Object Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false,
  });
  delete object.w;
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});
