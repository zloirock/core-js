QUnit.test('Math[@@toStringTag]', assert => {
  assert.strictEqual(Math[Symbol.toStringTag], 'Math', 'Math[@@toStringTag] is `Math`');
});
