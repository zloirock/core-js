QUnit.test('Number.isNaN', assert => {
  const { isNaN } = core.Number;
  const { create } = core.Object;
  assert.isFunction(isNaN);
  assert.ok(isNaN(NaN), 'Number.isNaN NaN');
  const notNaNs = [
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
  for (const value of notNaNs) {
    assert.ok(!isNaN(value), `not Number.isNaN ${ typeof value } ${ value }`);
  }
  assert.ok(!isNaN(create(null)), 'Number.isNaN(Object.create(null)) -> false');
});
