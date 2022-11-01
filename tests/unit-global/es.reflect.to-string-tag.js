QUnit.test('Reflect[@@toStringTag]', assert => {
  assert.same(Reflect[Symbol.toStringTag], 'Reflect', 'Reflect[@@toStringTag] is `Reflect`');
});
