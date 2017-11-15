QUnit.test('String#strike', assert => {
  const { strike } = String.prototype;
  assert.isFunction(strike);
  assert.arity(strike, 0);
  assert.name(strike, 'strike');
  assert.looksNative(strike);
  assert.nonEnumerable(String.prototype, 'strike');
  assert.same('a'.strike(), '<strike>a</strike>', 'lower case');
});
