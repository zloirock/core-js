import anchor from 'core-js-pure/fn/string/anchor';

QUnit.test('String#anchor', assert => {
  assert.isFunction(anchor);
  assert.same(anchor('a', 'b'), '<a name="b">a</a>', 'lower case');
  assert.same(anchor('a', '"'), '<a name="&quot;">a</a>', 'escape quotes');
});
