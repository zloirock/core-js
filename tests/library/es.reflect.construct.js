QUnit.test('Reflect.construct', function (assert) {
  var getPrototypeOf = core.Object.getPrototypeOf;
  var construct = core.Reflect.construct;
  assert.isFunction(construct);
  assert.arity(construct, 2);
  if ('name' in construct) {
    assert.name(construct, 'construct');
  }
  function A(a, b, c) {
    this.qux = a + b + c;
  }
  assert.strictEqual(construct(A, ['foo', 'bar', 'baz']).qux, 'foobarbaz', 'basic');
  A.apply = 42;
  assert.strictEqual(construct(A, ['foo', 'bar', 'baz']).qux, 'foobarbaz', 'works with redefined apply');
  var instance = construct(function () {
    this.x = 42;
  }, [], Array);
  assert.strictEqual(instance.x, 42, 'constructor with newTarget');
  assert.ok(instance instanceof Array, 'prototype with newTarget');
  assert.throws(function () {
    construct(42, []);
  }, TypeError, 'throws on primitive');
  function B() { /* empty */ }
  B.prototype = 42;
  assert.ok(function () {
    try {
      return getPrototypeOf(construct(B, [])) === Object.prototype;
    } catch (e) { /* empty */ }
  }());
  assert.same(typeof (function () {
    try {
      return construct(Date, []).getTime();
    } catch (e) { /* empty */ }
  }()), 'number', 'works with native constructors with 2 arguments');
  assert.throws(function () {
    construct(function () { /* empty */ });
  }, 'throws when the second argument is not an object');
});
