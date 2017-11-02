var test = QUnit.test;

test('Number.isSafeInteger', function (assert) {
  var isSafeInteger = core.Number.isSafeInteger;
  var create = core.Object.create;
  assert.isFunction(isSafeInteger);
  var safeIntegers = [
    1,
    -1,
    Math.pow(2, 16),
    Math.pow(2, 16) - 1,
    Math.pow(2, 31),
    Math.pow(2, 31) - 1,
    Math.pow(2, 32),
    Math.pow(2, 32) - 1,
    -0,
    9007199254740991,
    -9007199254740991
  ];
  for (var i = 0, length = safeIntegers.length; i < length; ++i) {
    var val = safeIntegers[i];
    assert.ok(isSafeInteger(val), 'isSafeInteger ' + typeof val + ' ' + val);
  }
  var notSafeIntegers = [
    9007199254740992,
    -9007199254740992,
    NaN,
    0.1,
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
  for (var i = 0, length = notSafeIntegers.length; i < length; ++i) {
    var val = notSafeIntegers[i];
    assert.ok(!isSafeInteger(val), 'not isSafeInteger ' + typeof val + ' ' + val);
  }
  assert.ok(!isSafeInteger(create(null)), 'Number.isSafeInteger(Object.create(null)) -> false');
});
