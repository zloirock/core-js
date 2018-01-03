import sup from 'core-js-pure/fn/string/sup';

QUnit.test('String#sup', assert => {
  assert.isFunction(sup);
  assert.same(sup('a'), '<sup>a</sup>', 'lower case');
});
