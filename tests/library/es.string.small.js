var test = QUnit.test;

test('String#small', function (assert) {
  var small = core.String.small;
  assert.isFunction(small);
  assert.same(small('a'), '<small>a</small>', 'lower case');
});
