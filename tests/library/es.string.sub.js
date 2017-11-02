var test = QUnit.test;

test('String#sub', function (assert) {
  var sub = core.String.sub;
  assert.isFunction(sub);
  assert.same(sub('a'), '<sub>a</sub>', 'lower case');
});
