import strike from 'core-js-pure/full/string/strike';

QUnit.test('String#strike', assert => {
  assert.isFunction(strike);
  assert.same(strike('a'), '<strike>a</strike>', 'lower case');
});
