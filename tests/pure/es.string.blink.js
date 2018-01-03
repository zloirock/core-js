import blink from '../../packages/core-js-pure/fn/string/blink';

QUnit.test('String#blink', assert => {
  assert.isFunction(blink);
  assert.same(blink('a'), '<blink>a</blink>', 'lower case');
});
