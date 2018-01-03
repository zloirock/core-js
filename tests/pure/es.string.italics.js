import italics from '../../packages/core-js-pure/fn/string/italics';

QUnit.test('String#italics', assert => {
  assert.isFunction(italics);
  assert.same(italics('a'), '<i>a</i>', 'lower case');
});
