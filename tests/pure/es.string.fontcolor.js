import fontcolor from 'core-js-pure/fn/string/fontcolor';

QUnit.test('String#fontcolor', assert => {
  assert.isFunction(fontcolor);
  assert.same(fontcolor('a', 'b'), '<font color="b">a</font>', 'lower case');
  assert.same(fontcolor('a', '"'), '<font color="&quot;">a</font>', 'escape quotes');
});
