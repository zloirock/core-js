var test = QUnit.test;

test('Number.EPSILON', function (assert) {
  var EPSILON = core.Number.EPSILON;
  assert.ok('EPSILON' in core.Number, 'EPSILON in Number');
  assert.strictEqual(EPSILON, Math.pow(2, -52), 'Is 2^-52');
  assert.ok(1 !== 1 + EPSILON, '1 isnt 1 + EPSILON');
  assert.strictEqual(1, 1 + EPSILON / 2, '1 is 1 + EPSILON / 2');
});
