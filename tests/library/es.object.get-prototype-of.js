QUnit.test('Object.getPrototypeOf', function (assert) {
  var create = core.Object.create;
  var getPrototypeOf = core.Object.getPrototypeOf;
  assert.isFunction(getPrototypeOf);
  assert.arity(getPrototypeOf, 1);
  assert.ok(getPrototypeOf({}) === Object.prototype);
  assert.ok(getPrototypeOf([]) === Array.prototype);
  function F() { /* empty */ }
  assert.ok(getPrototypeOf(new F()) === F.prototype);
  var object = { q: 1 };
  assert.ok(getPrototypeOf(create(object)) === object);
  assert.ok(getPrototypeOf(create(null)) === null);
  assert.ok(getPrototypeOf(getPrototypeOf({})) === null);
  function Foo() { /* empty */ }
  Foo.prototype.foo = 'foo';
  function Bar() { /* empty */ }
  Bar.prototype = create(Foo.prototype);
  Bar.prototype.constructor = Bar;
  assert.strictEqual(getPrototypeOf(Bar.prototype).foo, 'foo');
  var primitives = [42, 'foo', false];
  for (var i = 0, length = primitives.length; i < length; ++i) {
    var value = primitives[i];
    assert.ok(function () {
      try {
        getPrototypeOf(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + typeof value);
  }
  assert.throws(function () {
    getPrototypeOf(null);
  }, TypeError, 'throws on null');
  assert.throws(function () {
    getPrototypeOf(undefined);
  }, TypeError, 'throws on undefined');
  assert.strictEqual(getPrototypeOf('foo'), String.prototype);
});
