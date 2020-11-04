QUnit.test('Reflect[@@toStringTag]', assert => {
  assert.strictEqual(Reflect[Symbol.toStringTag], 'Reflect', 'Reflect[@@toStringTag] is `Reflect`');
});
