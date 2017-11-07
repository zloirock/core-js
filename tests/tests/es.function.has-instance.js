var test = QUnit.test;

test('Function#@@hasInstance', function (assert) {
  assert.ok(Symbol.hasInstance in Function.prototype);
  assert.nonEnumerable(Function.prototype, Symbol.hasInstance);
  assert.ok(Function[Symbol.hasInstance](function () { /* empty */ }));
  assert.ok(!Function[Symbol.hasInstance]({}));
});
