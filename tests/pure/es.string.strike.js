import strike from '../../packages/core-js-pure/fn/string/strike';

QUnit.test('String#strike', assert => {
  assert.isFunction(strike);
  assert.same(strike('a'), '<strike>a</strike>', 'lower case');
});
