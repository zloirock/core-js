QUnit.test('Object.hasOwn', assert => {
  const { create, hasOwn } = Object;
  assert.isFunction(hasOwn);
  assert.arity(hasOwn, 2);
  assert.name(hasOwn, 'hasOwn');
  assert.looksNative(hasOwn);
  assert.nonEnumerable(Object, 'hasOwn');
  assert.true(hasOwn({ q: 42 }, 'q'));
  assert.false(hasOwn({ q: 42 }, 'w'));
  assert.false(hasOwn(create({ q: 42 }), 'q'));
  assert.true(hasOwn(Object.prototype, 'hasOwnProperty'));
  let called = false;
  try {
    hasOwn(null, { toString() { called = true; } });
  } catch { /* empty */ }
  assert.false(called, 'modern behaviour');
  assert.throws(() => hasOwn(null, 'foo'), TypeError, 'throws on null');
  assert.throws(() => hasOwn(undefined, 'foo'), TypeError, 'throws on undefined');
});
