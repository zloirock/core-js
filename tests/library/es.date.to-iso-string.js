var test = QUnit.test;

test('Date#toISOString', function (assert) {
  var toISOString = core.Date.toISOString;
  assert.isFunction(toISOString);
  assert.strictEqual(toISOString(new Date(0)), '1970-01-01T00:00:00.000Z');
  assert.strictEqual(toISOString(new Date(1e12 + 1)), '2001-09-09T01:46:40.001Z');
  assert.strictEqual(toISOString(new Date(-5e13 - 1)), '0385-07-25T07:06:39.999Z');
  var future = toISOString(new Date(1e15 + 1));
  assert.ok(future === '+033658-09-27T01:46:40.001Z' || future === '33658-09-27T01:46:40.001Z');
  var prehistoric = toISOString(new Date(-1e15 + 1));
  assert.ok(prehistoric === '-029719-04-05T22:13:20.001Z' || prehistoric === '-29719-04-05T22:13:20.001Z');
  assert['throws'](function () {
    toISOString(new Date(NaN));
  }, RangeError);
});
