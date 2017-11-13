QUnit.test('Number.isFinite', function (assert) {
  var isFinite = core.Number.isFinite;
  var create = core.Object.create;
  assert.isFunction(isFinite);
  var finite = [
    1,
    0.1,
    -1,
    2 ** 16,
    2 ** 16 - 1,
    2 ** 31,
    2 ** 31 - 1,
    2 ** 32,
    2 ** 32 - 1,
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
