QUnit.test('Date.now', function (assert) {
  var now = core.Date.now;
  assert.isFunction(now);
  assert.ok(+new Date() - now() < 10, 'Date.now() ~ +new Date');
});
