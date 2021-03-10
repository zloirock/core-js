import blink from 'core-js-pure/full/string/blink';

QUnit.test('String#blink', assert => {
  assert.isFunction(blink);
  assert.same(blink('a'), '<blink>a</blink>', 'lower case');
});
