QUnit.test('String#blink', assert => {
  const { blink } = core.String;
  assert.isFunction(blink);
  assert.same(blink('a'), '<blink>a</blink>', 'lower case');
});
