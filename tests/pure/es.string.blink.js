import blink from 'core-js-pure/features/string/blink';

QUnit.test('String#blink', assert => {
  assert.isFunction(blink);
  assert.same(blink('a'), '<blink>a</blink>', 'lower case');
});
