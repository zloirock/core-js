import bind from 'core-js-pure/features/function/bind';

QUnit.test('Function#bind', assert => {
  assert.isFunction(bind);
  const object = { a: 42 };
  assert.same(bind(function () {
    return this.a;
  }, object)(), 42);
  assert.same(new (bind(() => { /* empty */ }, object))().a, undefined);
  function C(a, b) {
    this.a = a;
    this.b = b;
  }
  const instance = new (bind(C, null, 1))(2);
  assert.ok(instance instanceof C);
  assert.same(instance.a, 1);
  assert.same(instance.b, 2);
  assert.same(bind((it => it), null, 42)(), 42);
  const regExpTest = bind(RegExp.prototype.test, /a/);
  assert.ok(regExpTest('a'));
  const Date2017 = bind(Date, null, 2017);
  const date = new Date2017(11);
  assert.ok(date instanceof Date);
  assert.same(date.getFullYear(), 2017);
  assert.same(date.getMonth(), 11);
});
