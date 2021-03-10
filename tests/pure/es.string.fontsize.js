import fontsize from 'core-js-pure/full/string/fontsize';

QUnit.test('String#fontsize', assert => {
  assert.isFunction(fontsize);
  assert.same(fontsize('a', 'b'), '<font size="b">a</font>', 'lower case');
  assert.same(fontsize('a', '"'), '<font size="&quot;">a</font>', 'escape quotes');
});
