QUnit.test('Number.isFinite', function (assert) {
  var isFinite = Number.isFinite;
  var create = Object.create;
  assert.isFunction(isFinite);
  assert.name(isFinite, 'isFinite');
  assert.arity(isFinite, 1);
  assert.looksNative(isFinite);
  assert.nonEnumerable(Number, 'isFinite');
  var finite = [
    1,
    0.1,
    -1,
    Math.pow(2, 16),
    Math.pow(2, 16) - 1,
    Math.pow(2, 31),
    Math.pow(2, 31) - 1,
    Math.pow(2, 32),
    Math.pow(2, 32) - 1,
    -0
  ];
  for (var i = 0, length = finite.length; i < length; ++i) {
    var val = finite[i];
    assert.ok(isFinite(val), 'isFinite ' + typeof val + ' ' + val);
  }
  var notFinite = [
    NaN,
    Infinity,
    'NaN',
    '5',
    false,
    new Number(NaN),
    new Number(Infinity),
    new Number(5),
    new Number(0.1),
    undefined,
    null,
    {},
    function () { /* empty */ }
  ];
  for (var i = 0, length = notFinite.length; i < length; ++i) {
    var val = notFinite[i];
    assert.ok(!isFinite(val), 'not isFinite ' + typeof val + ' ' + val);
  }
  assert.ok(!isFinite(create(null)), 'Number.isFinite(Object.create(null)) -> false');
});
