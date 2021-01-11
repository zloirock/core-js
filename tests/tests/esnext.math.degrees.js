QUnit.test('Math.degrees', assert => {
  const { degrees, PI } = Math;
  assert.isFunction(degrees);
  assert.name(degrees, 'degrees');
  assert.arity(degrees, 1);
  assert.looksNative(degrees);
  assert.nonEnumerable(Math, 'degrees');
  assert.same(degrees(0), 0);
  assert.same(degrees(PI / 2), 90);
  assert.same(degrees(PI), 180);
  assert.same(degrees(3 * PI / 2), 270);
});
