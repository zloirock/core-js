import strike from 'core-js-pure/features/string/strike';

QUnit.test('String#strike', assert => {
  assert.isFunction(strike);
  assert.same(strike('a'), '<strike>a</strike>', 'lower case');
});
