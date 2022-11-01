QUnit.test('Math[@@toStringTag]', assert => {
  assert.same(Math[Symbol.toStringTag], 'Math', 'Math[@@toStringTag] is `Math`');
});
