var test = QUnit.test;

test('asap', function (assert) {
  assert.expect(5);
  assert.isFunction(asap);
  assert.arity(asap, 1);
  assert.name(asap, 'asap');
  assert.looksNative(asap);
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
