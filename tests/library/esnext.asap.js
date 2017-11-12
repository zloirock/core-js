QUnit.test('asap', function (assert) {
  var asap = core.asap;
  assert.expect(3);
  assert.isFunction(asap);
  assert.arity(asap, 1);
  var async = assert.async();
  var done = false;
  var after = false;
  asap(function () {
    if (!done) {
      done = true;
      assert.ok(after, 'works');
      async();
    }
  });
  setTimeout(function () {
    if (!done) {
      done = true;
      assert.ok(false, 'fails');
      async();
    }
  }, 3e3);
  after = true;
});
