QUnit.test('Function#bind', assert => {
  const { bind } = core.Function;
  assert.isFunction(bind);
  const object = { a: 42 };
  assert.ok(bind(function () {
    return this.a;
  }, object)() === 42);
  assert.ok(new (bind(() => { /* empty */ }, object))().a === undefined);
  function C(a, b) {
    this.a = a;
    this.b = b;
  }
  const instance = new (bind(C, null, 1))(2);
  assert.ok(instance instanceof C);
  assert.strictEqual(instance.a, 1);
  assert.strictEqual(instance.b, 2);
  assert.ok(bind((it => it), null, 42)() === 42);
  const regExpTest = bind(RegExp.prototype.test, /a/);
  assert.ok(regExpTest('a'));
  const Date2017 = bind(Date, null, 2017);
  const date = new Date2017(11);
  assert.ok(date instanceof Date);
  assert.strictEqual(date.getFullYear(), 2017);
  assert.strictEqual(date.getMonth(), 11);
});
