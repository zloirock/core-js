import link from '../../packages/core-js-pure/fn/string/link';

QUnit.test('String#link', assert => {
  assert.isFunction(link);
  assert.same(link('a', 'b'), '<a href="b">a</a>', 'lower case');
  assert.same(link('a', '"'), '<a href="&quot;">a</a>', 'escape quotes');
});
