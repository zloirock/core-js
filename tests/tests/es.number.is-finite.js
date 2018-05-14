QUnit.test('Number.isFinite', assert => {
  const { isFinite } = Number;
  const { create } = Object;
  assert.isFunction(isFinite);
  assert.name(isFinite, 'isFinite');
  assert.arity(isFinite, 1);
  assert.looksNative(isFinite);
  assert.nonEnumerable(Number, 'isFinite');
  const finite = [
    1,
    0.1,
    -1,
    2 ** 16,
    2 ** 16 - 1,
    2 ** 31,
    2 ** 31 - 1,
    2 ** 32,
    2 ** 32 - 1,
    -0,
  ];
  for (const value of finite) {
    assert.ok(isFinite(value), `isFinite ${ typeof value } ${ value }`);
  }
  const notFinite = [
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
    function () { /* empty */ },
  ];
  for (const value of notFinite) {
    assert.ok(!isFinite(value), `not isFinite ${ typeof value } ${ value }`);
  }
  assert.ok(!isFinite(create(null)), 'Number.isFinite(Object.create(null)) -> false');
});
