QUnit.test('Object.iterateEntries', assert => {
  const { iterateEntries } = Object;
  assert.isFunction(iterateEntries);
  assert.name(iterateEntries, 'iterateEntries');
  assert.arity(iterateEntries, 1);
  assert.looksNative(iterateEntries);
  assert.nonEnumerable(Object, 'iterateEntries');

  const object = {
    q: 1,
    w: 2,
    e: 3,
  };
  const iterator = iterateEntries(object);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Object Iterator');
  assert.deepEqual(iterator.next(), {
    value: ['q', 1],
    done: false,
  });
  delete object.w;
  assert.deepEqual(iterator.next(), {
    value: ['e', 3],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});
