import big from 'core-js-pure/fn/string/big';

QUnit.test('String#big', assert => {
  assert.isFunction(big);
  assert.same(big('a'), '<big>a</big>', 'lower case');
});
