QUnit.test('Object.hasOwn', assert => {
  const { create, hasOwn } = Object;
  assert.isFunction(hasOwn);
  assert.arity(hasOwn, 2);
  assert.name(hasOwn, 'hasOwn');
  assert.looksNative(hasOwn);
  assert.nonEnumerable(Object, 'hasOwn');
  assert.deepEqual(hasOwn({ q: 42 }, 'q'), true);
  assert.deepEqual(hasOwn({ q: 42 }, 'w'), false);
  assert.deepEqual(hasOwn(create({ q: 42 }), 'q'), false);
  assert.deepEqual(hasOwn(Object.prototype, 'hasOwnProperty'), true);
  assert.throws(() => hasOwn(null, 'foo'), TypeError, 'throws on null');
  assert.throws(() => hasOwn(undefined, 'foo'), TypeError, 'throws on undefined');
});
