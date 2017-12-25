QUnit.test('Object.is', assert => {
  const { is } = core.Object;
  assert.isFunction(is);
  assert.ok(is(1, 1), '1 is 1');
  assert.ok(is(NaN, NaN), '1 is 1');
  assert.ok(!is(0, -0), '0 isnt -0');
  assert.ok(!is({}, {}), '{} isnt {}');
});
