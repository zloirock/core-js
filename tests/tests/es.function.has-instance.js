QUnit.test('Function#@@hasInstance', assert => {
  assert.true(Symbol.hasInstance in Function.prototype);
  assert.nonEnumerable(Function.prototype, Symbol.hasInstance);
  assert.true(Function[Symbol.hasInstance](() => { /* empty */ }));
  assert.false(Function[Symbol.hasInstance]({}));
});
