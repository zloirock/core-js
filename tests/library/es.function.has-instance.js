var test = QUnit.test;

test('Function#@@hasInstance', function (assert) {
  assert.ok(core.Symbol.hasInstance in Function.prototype);
  assert.ok(Function[core.Symbol.hasInstance](function () { /* empty */ }));
  assert.ok(!Function[core.Symbol.hasInstance]({}));
});
