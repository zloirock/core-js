var test = QUnit.test;

test('Function#bind', function (assert) {
  var bind = core.Function.bind;
  assert.isFunction(bind);
  var object = {
    a: 42
  };
  assert.ok(bind(function () {
    return this.a;
  }, object)() === 42);
  assert.ok(new (bind(function () { /* empty */ }, object))().a === undefined);
  function fn(a, b) {
    this.a = a;
    this.b = b;
  }
  var instance = new (bind(fn, null, 1))(2);
  assert.ok(instance instanceof fn);
  assert.strictEqual(instance.a, 1);
  assert.strictEqual(instance.b, 2);
  assert.ok(bind(function (it) {
    return it;
  }, null, 42)() === 42);
  var regExpTest = bind(RegExp.prototype.test, /a/);
  assert.ok(regExpTest('a'));
  var F = bind(Date, null, 2015);
  var date = new F(6);
  assert.ok(date instanceof Date);
  assert.strictEqual(date.getFullYear(), 2015);
  assert.strictEqual(date.getMonth(), 6);
});
