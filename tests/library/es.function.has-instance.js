QUnit.test('Function#@@hasInstance', assert => {
  assert.ok(core.Symbol.hasInstance in Function.prototype);
  assert.ok(Function[core.Symbol.hasInstance](() => { /* empty */ }));
  assert.ok(!Function[core.Symbol.hasInstance]({}));
});
