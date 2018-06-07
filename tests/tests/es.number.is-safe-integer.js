QUnit.test('Number.isSafeInteger', assert => {
  const { isSafeInteger } = Number;
  const { create } = Object;
  assert.isFunction(isSafeInteger);
  assert.name(isSafeInteger, 'isSafeInteger');
  assert.arity(isSafeInteger, 1);
  assert.looksNative(isSafeInteger);
  assert.nonEnumerable(Number, 'isSafeInteger');
  const safeIntegers = [
    1,
    -1,
    2 ** 16,
    2 ** 16 - 1,
    2 ** 31,
    2 ** 31 - 1,
    2 ** 32,
    2 ** 32 - 1,
    -0,
    9007199254740991,
    -9007199254740991,
  ];
  for (const value of safeIntegers) {
    assert.ok(isSafeInteger(value), `isSafeInteger ${ typeof value } ${ value }`);
  }
  const notSafeIntegers = [
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
    function () { /* empty */ },
  ];
  for (const value of notSafeIntegers) {
    assert.ok(!isSafeInteger(value), `not isSafeInteger ${ typeof value } ${ value }`);
  }
  assert.ok(!isSafeInteger(create(null)), 'Number.isSafeInteger(Object.create(null)) -> false');
});
