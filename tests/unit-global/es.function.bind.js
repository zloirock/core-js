QUnit.test('Function#bind', assert => {
  const { bind } = Function.prototype;
  assert.isFunction(bind);
  assert.arity(bind, 1);
  assert.name(bind, 'bind');
  assert.looksNative(bind);
  assert.nonEnumerable(Function.prototype, 'bind');
  const object = { a: 42 };
  assert.same(function () {
    return this.a;
  }.bind(object)(), 42);
  // eslint-disable-next-line no-extra-bind -- testing
  assert.same(new (function () { /* empty */ }.bind(object))().a, undefined);
  function A(a, b) {
    this.a = a;
    this.b = b;
  }
  const instance = new (A.bind(null, 1))(2);
  assert.true(instance instanceof A);
  assert.same(instance.a, 1);
  assert.same(instance.b, 2);
  assert.same((it => it).bind(null, 42)(), 42);
  const regExpTest = RegExp.prototype.test.bind(/a/);
  assert.true(regExpTest('a'));
  const Date2017 = Date.bind(null, 2017);
  const date = new Date2017(11);
  assert.true(date instanceof Date);
  assert.same(date.getFullYear(), 2017);
  assert.same(date.getMonth(), 11);
});
