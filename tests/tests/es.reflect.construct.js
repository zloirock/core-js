QUnit.test('Reflect.construct', assert => {
  const { construct } = Reflect;
  const { getPrototypeOf } = Object;
  assert.isFunction(construct);
  assert.arity(construct, 2);
  assert.name(construct, 'construct');
  assert.looksNative(construct);
  assert.nonEnumerable(Reflect, 'construct');
  function A(a, b, c) {
    this.qux = a + b + c;
  }
  assert.strictEqual(construct(A, ['foo', 'bar', 'baz']).qux, 'foobarbaz', 'basic');
  A.apply = 42;
  assert.strictEqual(construct(A, ['foo', 'bar', 'baz']).qux, 'foobarbaz', 'works with redefined apply');
  const instance = construct(function () {
    this.x = 42;
  }, [], Array);
  assert.strictEqual(instance.x, 42, 'constructor with newTarget');
  assert.ok(instance instanceof Array, 'prototype with newTarget');
  assert.throws(() => construct(42, []), TypeError, 'throws on primitive');
  function B() { /* empty */ }
  B.prototype = 42;
  assert.notThrows(() => getPrototypeOf(construct(B, [])) === Object.prototype);
  assert.notThrows(() => typeof construct(Date, []).getTime() == 'number', 'works with native constructors with 2 arguments');
  assert.throws(() => construct(() => { /* empty */ }), 'throws when the second argument is not an object');
});

