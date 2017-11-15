QUnit.test('Function#@@hasInstance', assert => {
  assert.ok(Symbol.hasInstance in Function.prototype);
  assert.nonEnumerable(Function.prototype, Symbol.hasInstance);
  assert.ok(Function[Symbol.hasInstance](() => { /* empty */ }));
  assert.ok(!Function[Symbol.hasInstance]({}));
});
