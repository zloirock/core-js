var test = QUnit.test;

test('Function#bind', function (assert) {
  var bind = Function.prototype.bind;
  assert.isFunction(bind);
  assert.arity(bind, 1);
  assert.name(bind, 'bind');
  assert.looksNative(bind);
  assert.nonEnumerable(Function.prototype, 'bind');
  assert.same(function () {
    return this.a;
  }.bind({ a: 42 })(), 42);
  assert.same(new (function () { /* empty */ })().a, undefined);
  function A(a, b) {
    this.a = a;
    this.b = b;
  }
  var instance = new (A.bind(null, 1))(2);
  assert.ok(instance instanceof A);
  assert.strictEqual(instance.a, 1);
  assert.strictEqual(instance.b, 2);
  assert.same(function (it) {
    return it;
  }.bind(null, 42)(), 42);
  var regExpTest = RegExp.prototype.test.bind(/a/);
  assert.ok(regExpTest('a'));
  var Date2017 = Date.bind(null, 2017);
  var date = new Date2017(11);
  assert.ok(date instanceof Date);
  assert.strictEqual(date.getFullYear(), 2017);
  assert.strictEqual(date.getMonth(), 11);
});
