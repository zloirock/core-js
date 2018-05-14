QUnit.test('Reflect.apply', assert => {
  const { apply } = Reflect;
  assert.isFunction(apply);
  assert.arity(apply, 3);
  assert.name(apply, 'apply');
  assert.looksNative(apply);
  assert.nonEnumerable(Reflect, 'apply');
  assert.strictEqual(apply(Array.prototype.push, [1, 2], [3, 4, 5]), 5);
  function f(a, b, c) {
    return a + b + c;
  }
  f.apply = 42;
  assert.strictEqual(apply(f, null, ['foo', 'bar', 'baz']), 'foobarbaz', 'works with redefined apply');
  assert.throws(() => apply(42, null, []), TypeError, 'throws on primitive');
  assert.throws(() => apply(() => { /* empty */ }, null), TypeError, 'throws without third argument');
  assert.throws(() => apply(() => { /* empty */ }, null, '123'), TypeError, 'throws on primitive as third argument');
});
