var test = QUnit.test;

test('Reflect.apply', function (assert) {
  var apply = core.Reflect.apply;
  assert.isFunction(apply);
  assert.arity(apply, 3);
  if ('name' in apply) {
    assert.name(apply, 'apply');
  }
  assert.strictEqual(apply(Array.prototype.push, [1, 2], [3, 4, 5]), 5);
  function F(a, b, c) {
    return a + b + c;
  }
  F.apply = 42;
  assert.strictEqual(apply(F, null, ['foo', 'bar', 'baz']), 'foobarbaz', 'works with redefined apply');
  assert['throws'](function () {
    apply(42, null, []);
  }, TypeError, 'throws on primitive');
  assert['throws'](function () {
    apply(function () { /* empty */ }, null);
  }, TypeError, 'throws without third argument');
  assert['throws'](function () {
    apply(function () { /* empty */ }, null, '123');
  }, TypeError, 'throws on primitive as third argument');
});
